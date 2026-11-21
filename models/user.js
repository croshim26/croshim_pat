const Sequelize=require('sequelize');


const sequelize=require('../util/database');

const User =sequelize.define('user',{
    id: {
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    } , 
    firstName: {
        type:Sequelize.STRING,
        allowNull:true
    },

    lastName: {
        type:Sequelize.STRING,
        allowNull:true
    },

    password: {
        type:Sequelize.STRING,
        allowNull:true
    },

    phone: {
        type:Sequelize.STRING,
        allowNull:true
    },

    phone_normalized: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
    },

    email: {
        type:Sequelize.STRING,
        allowNull:true,
        unique: true
    },

    reset_token: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    reset_token_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
    },

    email_verification_token: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    email_verification_token_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
    },

    email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
    },

    is_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },

    pattern_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
    },

    country: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    gender: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    crochet_experience: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    age: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },

    last_login: {
        type: Sequelize.DATE,
        allowNull: true,
    },

    registration_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
    },

    registration_country: {
        type: Sequelize.STRING(2),
        allowNull: true,
    },
});

module.exports=User
