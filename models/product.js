const Sequelize=require('sequelize');


const sequelize=require('../util/database');

const Product =sequelize.define('product',{
    id: {
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    } , 
    product_name: {
        type:Sequelize.STRING,
        allowNull:true
    },

    product_description: {
        type:Sequelize.TEXT,
        allowNull:true
    },


    user_id: {
        type:Sequelize.INTEGER,
        allowNull:false
    },
    pdf_path: {
        type: Sequelize.STRING,
        allowNull: true
      }


});

module.exports=Product

