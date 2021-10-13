
const fs = require('fs');
const path = require('path');

const xlsx = require("xlsx")//npm install xlsx


const samvHajjGroup = require('../models/samvHajjGroup');
const Users = require('../models/Users');


const nodemailer=require("nodemailer")
const sendgridTransport=require("nodemailer-sendgrid-transport");


const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key:"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"
  
  
  }
  
  }))





exports.getadminGroup=(req,res,next)=>{

  samvHajjGroup.find().select("reason fullName excel email identity_id email company jopTitle phone TeamSize groupNumber accept").then(group=>{

    res.render("admin/display_group",{
      group:group,
  

    })

})





}





exports.getadminGroupAccept=(req,res,next)=>{
  samvHajjGroup.find().select("accept").then(data=>{
    

    res.render("admin/accept_group")
  
})
  
 }


 exports.postAcceptGroup= async(req,res,next)=>{
  const accepting="accept"
  var email=req.body.email



  const useraccepting =await samvHajjGroup.findOne({email:email}).select("accept email").then(data=>{

    console.log(data);
    if (email==req.body.email ) {
      samvHajjGroup.updateOne({email:data.email},{accept:accepting}).then(update=>{

  console.log(update);
  
  
        }).then(result => {
           
     
  
    
        }) .catch(err => {
          console.log(err);

        });
       

        

      }

   
      return transporter.sendMail({
        to:email,
        from:"smav@dmet.edu.sa",
        subject:"succeed",
        html:"<h1> مبروك انقبلت </h1>"
      })

     
          })


          res.redirect("display_group")
}




exports.getWaitGroup=(req,res,next)=>{
  samvHajjGroup.find().select("accept").then(data=>{

  
  res.render("admin/wait_group")

})

}


exports.postWaitGroup= async(req,res,next)=>{
const accepting="wait"
var email=req.body.email



const useraccepting =await samvHajjGroup.findOne({email:email}).select("accept email").then(data=>{

  console.log(data);
  if (email==req.body.email ) {
    samvHajjGroup.updateOne({email:data.email},{accept:accepting}).then(update=>{

console.log(update);


      }).then(result => {
         
   

  
      }) .catch(err => {
        console.log(err);

      });
     

      

    }


   
        })


        res.redirect("display_group")
}

////////

exports.getRefuseGroup=(req,res,next)=>{
  samvHajjGroup.find().select("accept").then(data=>{

  
  res.render("admin/refuse_group")

})

}


exports.postRefuseGroup= async(req,res,next)=>{
const accepting="refuse"
var email=req.body.email
var reason=req.body.reason;



const useraccepting =await samvHajjGroup.findOne({email:email}).select("accept email").then(data=>{

  console.log(data);
  if (email==req.body.email ) {
    samvHajjGroup.updateOne({email:data.email},{accept:accepting,reason:reason}).then(update=>{

console.log(update);


      }).then(result => {
         
   

  
      }) .catch(err => {
        console.log(err);

      });
     

      

    }


   
        })


        res.redirect("display_group")
}

////////


exports.getadminUsers=(req,res,next)=>{




  Users.find().select("firstName_En middleName_En lastName_En firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_users",{
      users:users,
  

    })

})

}

exports.getadminUsersAccept=(req,res,next)=>{




  Users.find({accept:"accept"}).select("firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_usersAccept",{
      users:users,
  

    })

})








}

exports.getadminUsersRefuse=(req,res,next)=>{




  Users.find({accept:"refuse"}).select("firstName_En middleName_En lastName_En firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_usersRefuse",{
      users:users,
  

    })

})








}



exports.getadminUsersWait=(req,res,next)=>{




  Users.find({accept:"wait"}).select("firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_usersWait",{
      users:users,
  

    })

})

}


exports.postadminUsersWait=async(req,res,next)=>{

  const accepting="wait"
    var email=req.body.email



    const useraccepting =await Users.findOne({email:email}).select("accept email").then(data=>{

      console.log(data);
      if (email==req.body.email ) {
        Users.updateOne({email:data.email},{accept:accepting}).then(update=>{
  
    console.log(update);
    
    
          }).then(result => {
             
       
    
      
          }) .catch(err => {
            console.log(err);

          });
         
  
          

        }



       
            })
  
  
            res.redirect("display_usersWait")

}










     exports.getRefuse=(req,res,next)=>{
      Users.find().select("accept").then(data=>{

    
        res.render("admin/refuse_users")
      
    })
      
     }


     exports.postRefuse= async(req,res,next)=>{
      const accepting="refuse"
      const email= req.body.email


  
      var userEditing = await Users.findOne({email:email}).select("accept email").then(data=>{
    

        console.log(userEditing);

        if (data.email==req.body.email ) {
      
          console.log(data);
          Users.updateOne({email:data.email},{accept:accepting}).then(update=>{
    
            console.log(update);
        

            

      
                  }).then(result => {
             
       
    
      
                  }) .catch(err => {
                    console.log(err);
        
                  });


                  return transporter.sendMail({
                    to:email,
                    from:"smav@dmet.edu.sa",
                    subject:"succeed",
                    html:`
                    
                    
                    
        <td class="esd-structure es-p20t es-p20b es-p20r es-p20l" align="left">
        <table width="100%" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td class="esd-container-frame" width="960" valign="top" align="center">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td class="esd-block-image" align="center" style="font-size:0"><a href="https://www.smavacadmey.com" target="_blank"><img src="https://i.imgur.com/WuxuLUZ.png" alt style="display: block;" width="562"></a></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
<!-- //// -->
    <td class="esd-stripe" esd-custom-block-id="19035" align="center">
        <table class="es-content-body" style="background-color: #333333;" width="600" cellspacing="0" cellpadding="0" bgcolor="#333333" align="center">
            <tbody>
              
                <tr>
                    <td class="esd-structure es-p25t es-p40b es-p40r es-p40l" esd-custom-block-id="9786" align="left">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td class="esd-container-frame" width="520" valign="top" align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c es-p15b" align="center">
                                                        <h2 style="color: #efefef;">Welcome To SMAV Match</h2>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c es-p20b" align="center">
                                                        <p style="color: #efefef;">
                                                            <p style="color: #efefef;">
                                                                السلام عليكم ورحمة الله وبركاته

                                                            </p>
                                                            


                                                            <p style="color: #efefef;">


                                                                عزيزي المتطوع

                                                            </p>

                                                            <p style="color: white;">
                                                          

                                                                نقدر لك رغبتك ومبادرتك للمشاركة في البرنامج                                                            



                                                            </p>
                                                            <p style="color: white;">
                                                                ونأسف لإبلاغك بعدم قبولك للالتحاق بالبرنامج لهذا الموسم، على آمل أن نلتقي بكم في ميادين التطوع والخير وخدمة المجتمع
                                                            </p>

                                                            <p style="color: white;">
                                                                وتذكر أن المسلم يُثاب على قدر نيّته، كما قال شيخ الإسلام ابن تيمية في الفتاوى الكبرى: "أن من نوى الخير وعمل منه مقدوره وعجز عن إكماله كان له أجر عامله" 
                                                            </p>

                                                            <p style="color: white;">
                                                                :حيث أن الأسباب تتلخص فيما يلي:

                                                            </p>

                                                            <p style="color: white;">
                                                                 اكتمال مقاعد التدريب-
                                                            </p>


                                                    </td>
                                                </tr>
                                              
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="esd-structure" align="left">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td class="esd-container-frame" width="600" valign="top" align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-banner" style="position: relative;" align="center" esdev-config="h2"><a target="_blank"> 
                                                            <img class="adapt-img esdev-stretch-width esdev-banner-rendered" src="https://thumbs.gfycat.com/SpitefulCommonEidolonhelvum-size_restricted.gif" alt title width="100%">
                                                        </a>
                                                    </td>


                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
    <!-- /////// -->


    <td class="esd-stripe" esd-custom-block-id="9796" align="center" >
        <table class="es-footer-body" style="border-top:1px solid #333333;" width="600" cellspacing="0" cellpadding="0" align="center" style="background-color: #333333;">
            <tbody style="background-color: #333333;">
                <tr style="background-color: #333333;">
                    <td class="esd-structure es-p20t es-p20b es-p20r es-p20l" align="left">
                        <!--[if mso]><table width="560" cellpadding="0"
                                cellspacing="0"><tr><td width="180" valign="top"><![endif]-->
                        <table class="es-left" cellspacing="0" cellpadding="0" align="left">
                            <tbody>
                                <tr>
                                    <td class="es-m-p0r es-m-p20b esd-container-frame" width="180" valign="top" align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #333333;">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-image es-p15b es-m-txt-c" align="left" style="font-size:0"><a target="_blank" href="https://viewstripo.email/"><img src="https://i.imgur.com/WuxuLUZ.png" alt="Flowers logo" style="display: block;" title="Flowers logo" width="135"></a></td>
                                                </tr>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c" esd-links-underline="none" align="left">
                                                        <p><a target="_blank" href="tel:+966 55 222 6883" style="text-decoration: none; color: white;  padding-left: 1rem;"> +966552226883</a></p>
                                                        <p><a target="_blank" href="smav@dmet.edu.sa" style="text-decoration: none; color: white;  padding-left: 1rem;"> smav@dmet.edu.sa</a></p>
                                                        <p style="color: white;  padding-left: 1rem;  padding-bottom: 1rem;" > © 2021 SMAV</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <!--[if mso]></td><td width="20"></td><td width="360" valign="top"><![endif]-->
                        <table cellspacing="0" cellpadding="0" align="right" style="background-color: #333333;">
                            <tbody>
                                <tr>
                                    <td class="esd-container-frame" width="360" align="left">
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-social es-p15b es-m-txt-c" align="left" style="font-size:0">
                                                        <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Facebook" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/facebook-circle-gray-bordered.png" alt="Fb" width="32"></a></td>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Twitter" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/twitter-circle-gray-bordered.png" alt="Tw" width="32"></a></td>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Instagram" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/instagram-circle-gray-bordered.png" alt="Inst" width="32"></a></td>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Youtube" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/youtube-circle-gray-bordered.png" alt="Yt" width="32"></a></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c" align="left">
                                                        <p style="color: white;">You are receiving this 
                                                            email because you have visited our site or asked us about regular newsletter.</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </tbody>
        </table>
    </td>





    
                    
                    `
                  })
                 
          
              

    
        }

    
      
    

    
  
              })
    
    
              res.redirect("display_users")
  }





  exports.getAccept=(req,res,next)=>{
    Users.find().select("accept").then(data=>{

  
      res.render("admin/accept_users")
    
  })
    
   }


   exports.postAccept= async(req,res,next)=>{
    const accepting="accept"
    var email=req.body.email



    const useraccepting =await Users.findOne({email:email}).select("accept email").then(data=>{

      console.log(data);
      if (email==req.body.email ) {
        Users.updateOne({email:data.email},{accept:accepting}).then(update=>{
  
    console.log(update);
    
    
          }).then(result => {
             
       
    
      
          }) .catch(err => {
            console.log(err);

          });
         
  
          

        }

     
        return transporter.sendMail({
          to:email,
          from:"smav@dmet.edu.sa",
          subject:"succeed",
          html:`
          
          
        <td class="esd-structure es-p20t es-p20b es-p20r es-p20l" align="left">
        <table width="100%" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td class="esd-container-frame" width="960" valign="top" align="center">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td class="esd-block-image" align="center" style="font-size:0"><a href="https://www.smavacadmey.com" target="_blank"><img src="https://i.imgur.com/WuxuLUZ.png" alt style="display: block;" width="562"></a></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
<!-- //// -->
    <td class="esd-stripe" esd-custom-block-id="19035" align="center">
        <table class="es-content-body" style="background-color: #333333;" width="600" cellspacing="0" cellpadding="0" bgcolor="#333333" align="center">
            <tbody>
              
                <tr>
                    <td class="esd-structure es-p25t es-p40b es-p40r es-p40l" esd-custom-block-id="9786" align="left">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td class="esd-container-frame" width="520" valign="top" align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c es-p15b" align="center">
                                                        <h2 style="color: #efefef;">Welcome To SMAV Match</h2>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c es-p20b" align="center">
                                                        <p style="color: #efefef;">
                                                            <p style="color: #efefef;">
                                                                السلام عليكم ورحمة الله وبركاته

                                                            </p>
                                                            


                                                            <p style="color: #efefef;">


                                                                عزيزي المتطوع

                                                            </p>

                                                            <p style="color: white;">
                                                          
                                                                يشرفنا في الأكاديمية السعودية للتطوع الصحي أن نرحب بانضمامكم إلى النخبة من المتطوعين الصحيين في برنامج سماف مجتمعي ، وحيث نبارك لكم قبولكم النهائي فإننا نرجو من الله أن يبارك في سعيكم، ونأمل أن يكون هذا البرنامج استكمالاً لمسيرتكم التطوعية وتأهيلاً علمياً وعملياً في مجال قيادة العمل التطوعي المحترف، ونقطة انطلاق لمبادراتكم التطوعية المجتمعية المبتكرة..
                                                            </p>
                                                            <p style="color: white;">
                                                                علماً بأن تفاصيل البرنامج والمنصة التعليمية سترسل إليكم قريباً،
                                                            </p>
                                                            
                                                    </td>
                                                </tr>
                                              
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="esd-structure" align="left">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td class="esd-container-frame" width="600" valign="top" align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-banner" style="position: relative;" align="center" esdev-config="h2"><a target="_blank">
                                                            <img class="adapt-img esdev-stretch-width esdev-banner-rendered" src="https://thumbs.gfycat.com/FarawayTestyChimneyswift-size_restricted.gif" alt title width="100%">
                                                        </a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
    <!-- /////// -->


    <td class="esd-stripe" esd-custom-block-id="9796" align="center" >
        <table class="es-footer-body" style="border-top:1px solid #333333;" width="600" cellspacing="0" cellpadding="0" align="center" style="background-color: #333333;">
            <tbody style="background-color: #333333;">
                <tr style="background-color: #333333;">
                    <td class="esd-structure es-p20t es-p20b es-p20r es-p20l" align="left">
                        <!--[if mso]><table width="560" cellpadding="0"
                                cellspacing="0"><tr><td width="180" valign="top"><![endif]-->
                        <table class="es-left" cellspacing="0" cellpadding="0" align="left">
                            <tbody>
                                <tr>
                                    <td class="es-m-p0r es-m-p20b esd-container-frame" width="180" valign="top" align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #333333;">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-image es-p15b es-m-txt-c" align="left" style="font-size:0"><a target="_blank" href="https://viewstripo.email/"><img src="https://i.imgur.com/WuxuLUZ.png" alt="Flowers logo" style="display: block;" title="Flowers logo" width="135"></a></td>
                                                </tr>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c" esd-links-underline="none" align="left">
                                                        <p><a target="_blank" href="tel:+966 55 222 6883" style="text-decoration: none; color: white;  padding-left: 1rem;"> +966552226883</a></p>
                                                        <p><a target="_blank" href="smav@dmet.edu.sa" style="text-decoration: none; color: white;  padding-left: 1rem;"> smav@dmet.edu.sa</a></p>
                                                        <p style="color: white;  padding-left: 1rem;  padding-bottom: 1rem;" > © 2021 SMAV</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <!--[if mso]></td><td width="20"></td><td width="360" valign="top"><![endif]-->
                        <table cellspacing="0" cellpadding="0" align="right" style="background-color: #333333;">
                            <tbody>
                                <tr>
                                    <td class="esd-container-frame" width="360" align="left">
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-social es-p15b es-m-txt-c" align="left" style="font-size:0">
                                                        <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Facebook" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/facebook-circle-gray-bordered.png" alt="Fb" width="32"></a></td>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Twitter" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/twitter-circle-gray-bordered.png" alt="Tw" width="32"></a></td>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Instagram" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/instagram-circle-gray-bordered.png" alt="Inst" width="32"></a></td>
                                                                    <td class="es-p10r" valign="top" align="center"><a target="_blank" href><img title="Youtube" src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/youtube-circle-gray-bordered.png" alt="Yt" width="32"></a></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="esd-block-text es-m-txt-c" align="left">
                                                        <p style="color: white;">You are receiving this 
                                                            email because you have visited our site or asked us about regular newsletter.</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </tbody>
        </table>
    </td>





    
          
          
          
          
          `
        })

       
            })
  
  
            res.redirect("display_users")
}




exports.getWait=(req,res,next)=>{
  Users.find().select("accept").then(data=>{


    res.render("admin/wait_users")
  
})
  
 }


 exports.postWait= async(req,res,next)=>{
  const accepting="wait"
  var email=req.body.email



  const useraccepting =await Users.findOne({email:email}).select("accept email").then(data=>{

    console.log(data);
    if (email==req.body.email ) {
      Users.updateOne({email:data.email},{accept:accepting}).then(update=>{

  console.log(update);
  
  
        }).then(result => {
           
     
  
    
        }) .catch(err => {
          console.log(err);

        });
       

        

      }


     
          })


          res.redirect("display_users")
}


exports.getAcceptExcel=(req,res,next)=>{






  Users.find({accept:"accept"}).select("times Specialty university city accept firstName_En  middleName_En lastName_En email age gender  SCFHS  EducationLevel  phone  ").then(data=>{


    res.send(JSON.stringify(data))


    
  
})
  
 }


//  https://data.page/json/csv


exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};