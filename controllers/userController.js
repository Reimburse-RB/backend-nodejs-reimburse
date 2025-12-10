const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");
const path = require("path");
const { isNil, isNotNil, dec } = require("ramda");
const UserFamily = require("../models/User-Family");
const allStatus = require("../utils/allStatus");
require("dotenv").config();
const fs = require("fs");
const {
  encryptAES,
  decryptAES,
  hashBcrypt,
  compareBcrypt,
  formatPlainUserData,
} = require("../utils/cryptography");
const { title } = require("process");
const { Op } = require("sequelize");
const Notification = require("../models/Notification");

module.exports = {
  userRegister: async (req, res, messaging) => {
    const { name, identity_number, role, email, password, fcm_token } =
      req.body;

    try {
      const checkEmail = await User.findOne({
        attributes: ["email"],
        where: {
          email: email,
        },
      });

      if (checkEmail) {
        return res.json({
          success: false,
          msg: "Email sudah digunakan!!",
        });
      }

      const encryptedPassword = encryptAES(password);
      const encryptedName = encryptAES(name);
      const encryptedIdentityNumber = encryptAES(identity_number);

      const hashPassword = await hashBcrypt(encryptedPassword);

      const token = jwt.sign({ email: email }, process.env.SECRET_KEY);

      const user = await User.create({
        fullname: encryptedName,
        email,
        password: hashPassword,
        identity_number: encryptedIdentityNumber,
        status: 2,
        role,
        token,
        fcm_token,
      });

      if (user) {
        const createFamily = await UserFamily.create({
          fullname: encryptedName,
          status: 1,
          user_id: user.id,
        });

        const now = new Date();
        const day = now.getDate().toString().padStart(2, "0"); // Pastikan dua digit
        const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Bulan dimulai dari 0
        const year = now.getFullYear();
        const formattedCreatedDate = `${year}-${month}-${day} ${now
          .toTimeString()
          .slice(0, 8)}`;

        const userAdmin = await User.findAll({
          where: {
            role: {
              [Op.in]: [2, 3],
            },
          },
        });

        userAdmin.forEach(async (item) => {
          const categoryNotification = "account_verification";
          const titleMessageNotification = `Pengguna Baru ${name} Menunggu Verifikasi`;
          const bodyMessageNotification = `Pengguna ${name} dengan Nomor Induk Karyawan ${identity_number} telah mendaftar dan membutuhkan verifikasi.`;

          const message = {
            notification: {
              title: titleMessageNotification,
              body: bodyMessageNotification,
            },
            data: {
              categoryNotification: `${categoryNotification}`,
              userId: `${user.id}`,
              date: `${formattedCreatedDate}`,
            },
            token: item.fcm_token ?? "",
          };

          try {
            await messaging.send(message);
          } catch (e) {
            console.error("Error sending message:", error);
          }

          await Notification.create({
            category_notification: categoryNotification,
            title: titleMessageNotification,
            body: bodyMessageNotification,
            user_id: user.id,
            category: 1, //admin/hrd
            token_target: item.fcm_token ?? "",
            date: formattedCreatedDate,
          });
        });

        return res.json({
          success: true,
          msg: "Berhasil membuat data",
          data: user,
        });
      }

      return res.json({
        success: true,
        msg: "Berhasil membuat data",
        data: formatPlainUserData(user),
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  userLogin: async (req, res) => {
    const { email, password, fcm_token } = req.body;
    try {
      const user = await User.findOne({ where: { email: email } });

      if (user) {
        const encryptedPassword = encryptAES(password);

        const validpass = await compareBcrypt(encryptedPassword, user.password);

        if (!validpass) {
          return res.json({
            success: false,
            msg: "Password Anda Salah!!",
          });
        }

        if (isNotNil(fcm_token)) {
          await Notification.update(
            { token_target: fcm_token },
            { where: { token_target: user.fcm_token } }
          );
          user.fcm_token = fcm_token;
          user.save();
        }

        return res.json({
          success: true,
          msg: "Anda Berhasil Login!!",
          token: user.token,
          user: user,
        });
      }

      return res.json({
        success: false,
        msg: "Anda Belum Terdaftar!!",
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  changePassword: async (req, res) => {
    const user = req.userAuth;
    const { oldPassword, newPassword } = req.body;
    try {
      if (isNil(oldPassword) || isNil(newPassword)) {
        return res.json({
          success: false,
          msg: "Gagal memperbarui data!",
        });
      }
      const encryptedPassword = encryptAES(oldPassword);

      const isPasswordValid = await compareBcrypt(
        encryptedPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.json({
          success: false,
          msg: "Gagal! Password lama salah",
        });
      }

      if (newPassword === oldPassword) {
        return res.json({
          success: false,
          msg: "Gagal! Password baru harus berbeda dari password lama",
        });
      }

      const encryptedPasswordNew = encryptAES(newPassword);

      const hashPassword = await hashBcrypt(encryptedPasswordNew);

      user.password = hashPassword;
      user.save();

      return res.json({
        success: true,
        msg: "Anda Berhasil Mengubah Password",
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  updateFcmToken: async (req, res) => {
    const user = req.userAuth;
    const { fcmToken } = req.body;
    try {
      if (isNil(fcmToken)) {
        return res.json({
          success: false,
          msg: "Gagal memperbarui data!",
        });
      }

      await Notification.update(
        { token_target: fcmToken },
        { where: { token_target: user.fcm_token } }
      );

      user.fcm_token = fcmToken;
      user.save();

      return res.json({
        success: true,
        msg: "Anda Berhasil Mengubah FCM Token",
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  getVerificationAccount: async (req, res) => {
    const user = req.userAuth;

    try {
      if (user.role != 2 && user.role != 3) {
        return res.json({
          success: false,
          msg: "Gagal mendapatkan data! Anda bukan Admin atau HRD",
        });
      }

      const allUser = await User.findAll({
        where: {
          status: 2,
        },
      });

      const returnData = [];
      for (const item of allUser) {
        const userFullname = decryptAES(item.fullname);
        const userIdentityNumber = decryptAES(item.identity_number);

        returnData.push({
          id: item.id,
          nik: userIdentityNumber,
          name: userFullname,
          img_url:
            item.image_url != null
              ? `${process.env.URL}${item.image_url}`
              : null,
        });
      }

      return res.json({
        success: true,
        msg: "Success getting data user verification!",
        data: returnData,
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  verificationAccount: async (req, res, messaging) => {
    const { userId } = req.body;
    const user = req.userAuth;

    try {
      if (isNil(userId)) {
        return res.json({
          success: false,
          msg: "Gagal! User tidak ditemukan",
        });
      }

      if (user.role != 2 && user.role != 3) {
        return res.json({
          success: false,
          msg: "Gagal! Anda bukan Admin atau HRD",
        });
      }

      const userDetail = await User.findOne({
        where: {
          id: userId,
        },
      });

      if (userDetail) {
        userDetail.status = 1;
        userDetail.save();

        const now = new Date();
        const day = now.getDate().toString().padStart(2, "0"); // Pastikan dua digit
        const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Bulan dimulai dari 0
        const year = now.getFullYear();
        const formattedCreatedDate = `${year}-${month}-${day} ${now
          .toTimeString()
          .slice(0, 8)}`;

        const categoryNotification = "verified_account";
        const titleMessageNotification = "Akun Anda Telah Diverifikasi";
        const bodyMessageNotification = `Akun Anda telah diverifikasi oleh Admin. Kini Anda dapat mulai menggunakan seluruh fitur yang tersedia di aplikasi.`;

        const message = {
          notification: {
            title: titleMessageNotification,
            body: bodyMessageNotification,
          },
          data: {
            categoryNotification: `${categoryNotification}`,
            date: `${formattedCreatedDate}`,
          },
          token: userDetail.fcm_token ?? "",
        };

        try {
          await messaging.send(message);
        } catch (e) {
          console.error("Error sending message:", error);
        }

        const userFullname = decryptAES(userDetail.fullname);
        const userIdentityNumber = decryptAES(userDetail.identity_number);

        await Notification.create({
          category_notification: categoryNotification,
          title: titleMessageNotification,
          body: bodyMessageNotification,
          date: formattedCreatedDate,
          user: userFullname,
          user_id: userDetail.id,
          identity_number: userIdentityNumber,
          category: 3, //general
          token_target: userDetail.fcm_token ?? "",
        });

        return res.json({
          success: true,
          msg: "Berhasil memverifikasi user",
          data: formatPlainUserData(userDetail),
        });
      }

      return res.json({
        success: false,
        msg: "Gagal memverifikasi user",
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  getProfile: async (req, res) => {
    const user = req.userAuth;
    try {
      const roleUser = allStatus.role.find(
        (itemRole) => itemRole.role_id === user.role
      );

      const userFullname = decryptAES(user.fullname);
      const userIdentityNumber = decryptAES(user.identity_number);

      const returnData = {
        nik: userIdentityNumber,
        name: userFullname,
        email: user.email,
        role_id: user.role,
        role_text: roleUser ? roleUser.role_text : "",
        is_account_verified: user.status == 1 ? true : false,
        fcm_token: user.fcm_token,
        img_url:
          user.image_url != null ? `${process.env.URL}${user.image_url}` : null,
      };
      console.log(returnData);

      const userFamily = await UserFamily.findAll({
        where: { user_id: user.id },
      });
      const detailFamily = [];
      if (userFamily.length > 0) {
        for (const item of userFamily) {
          const familyStatus = allStatus.familyOption.find(
            (itemFamStat) => itemFamStat.family_status_id === item.status
          );

          const userFullname = decryptAES(item.fullname);
          detailFamily.push({
            id: item.id,
            family_status_id: item.status,
            family_status_text: familyStatus
              ? familyStatus.family_status_text
              : "",
            name: userFullname,
          });
        }
      }

      returnData.family_member_data = detailFamily;

      return res.json({
        success: true,
        msg: "Berhasil mendapatkan data",
        data: returnData,
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  getDetailVerificationUser: async (req, res) => {
    const { userId } = req.body;
    const user = req.userAuth;
    try {
      if (isNil(userId)) {
        return res.json({
          success: false,
          msg: "Gagal mendapatkan data!",
        });
      }

      if (user.role != 2 && user.role != 3) {
        return res.json({
          success: false,
          msg: "Gagal mendapatkan data! Anda bukan Admin atau HRD",
        });
      }

      const detailUser = await User.findOne({
        where: {
          id: userId,
        },
      });

      var returnData = {};

      if (detailUser) {
        const roleUser = allStatus.role.find(
          (itemRole) => itemRole.role_id === detailUser.role
        );

        const userFullname = decryptAES(detailUser.fullname);
        const userIdentityNumber = decryptAES(detailUser.identity_number);

        returnData = {
          nik: userIdentityNumber,
          name: userFullname,
          email: detailUser.email,
          role_id: detailUser.role,
          role_text: roleUser ? roleUser.role_text : "",
          is_account_verified: detailUser.status == 1,
          img_url:
            detailUser.image_url != null
              ? `${process.env.URL}${detailUser.image_url}`
              : null,
        };

        const userFamily = await UserFamily.findAll({
          where: { user_id: userId },
        });
        const detailFamily = [];
        if (userFamily.length > 0) {
          for (const item of userFamily) {
            const familyStatus = allStatus.familyOption.find(
              (itemFamStat) => itemFamStat.family_status_id === item.status
            );

            const familyFullname = decryptAES(item.fullname);

            detailFamily.push({
              id: item.id,
              family_status_id: item.status,
              family_status_text: familyStatus
                ? familyStatus.family_status_text
                : "",
              name: familyFullname,
            });
          }
        }

        returnData.family_member_data = detailFamily;

        return res.json({
          success: true,
          msg: "Berhasil mendapatkan data",
          data: returnData,
        });
      }

      return res.json({
        success: false,
        msg: "Gagal mendapatkan data",
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  editUser: async (req, res) => {
    try {
      const { email, name, identity_number, family_member_data } = req.body;
      const user = req.userAuth;

      const encryptedName = encryptAES(name);
      const encryptedIdentityNumber = encryptAES(identity_number);

      user.fullname = encryptedName;
      user.email = email;
      user.identity_number = encryptedIdentityNumber;

      const family = await UserFamily.findAll({ where: { user_id: user.id } });
      if (!isNil(family_member_data)) {
        for (const itemFamily of family) {
          const idExists = family_member_data.some(
            (item) => item.id === itemFamily.id
          );
          if (!idExists) {
            itemFamily.destroy();
          }
        }

        const arrayFamilyCreate = [];
        for (const item of family_member_data) {
          const idExists = family.some((itemSome) => itemSome.id === item.id);

          if (idExists) {
            const familyDetail = await UserFamily.findOne({
              where: { id: item.id },
            });
            familyDetail.status = item.family_status_id;

            const encryptedNameFamily = encryptAES(item.name);
            familyDetail.fullname = encryptedNameFamily;

            familyDetail.save();
          } else {
            const encryptedNameFamily = encryptAES(item.name);

            arrayFamilyCreate.push({
              fullname: encryptedNameFamily,
              status: item.family_status_id,
              user_id: user.id,
            });
          }
        }

        const createFamily = await UserFamily.bulkCreate(arrayFamilyCreate);
      }

      await user.save();

      return res.json({
        success: true,
        msg: "Berhasil memperbarui data",
        data: formatPlainUserData(user),
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },

  editImageUser: async (req, res) => {
    try {
      const user = req.userAuth;

      if (req.file) {
        // Jika pengguna sudah memiliki gambar, hapus gambar yang lama
        if (user.image_url) {
          await fs.promises.unlink(path.join(`public/${user.image_url}`));
        }

        // Simpan path gambar baru
        user.image_url = `images/upload/${req.file.filename}`;
      }

      // Simpan perubahan ke database
      await user.save();

      return res.json({
        success: true,
        msg: "Berhasil memperbarui gambar profil",
        data: formatPlainUserData(user),
      });
    } catch (e) {
      console.error(`error: ${e.message}`);
      return res.json({ success: false, msg: "Terjadi Kesalahan!" });
    }
  },
};
