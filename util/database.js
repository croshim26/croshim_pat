const Sequelize=require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect:'mssql',
        host:'sqldatabasecrochet.database.windows.net',
        port:1433,
        dialectOptions:{
            options:{
                encrypt:true,
                trustServerCertificate:false
            }
        }
    }
);

sequelize.authenticate()
  .then(() => console.log('Connected successfully'))
  .catch(err => console.error('Connection failed:', err));

    module.exports=sequelize;