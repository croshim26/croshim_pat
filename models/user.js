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
});

module.exports=User

