
const fs = require('fs');
const path = require('path');


const tables = require('../models/tables');



const nodemailer=require("nodemailer")
const sendgridTransport=require("nodemailer-sendgrid-transport");


const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key:"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"
  
  
  }
  
  }))




exports.getadminPlace=(req,res,next)=>{

  tables.find().select("email lastNameA firstNameA  phone  dest").then(data=>{

    res.render("admin/display_place",{
      data:data
  

    })

})







}

exports.getPlaceAccept=(req,res,next)=>{

  tables.find().select("email lastNameA firstNameA  phone  tools").then(data=>{

    res.render("admin/display_place",{
      data:data
  

    })

})


}

exports.postPlaceAccept= async(req,res,next)=>{
  const accepting="accept"
  var email=req.body.email
  var number=req.body.number



  const useraccepting =await tables.findOne({email:email}).select("dest email")
.then(data=>{

    if (email==req.body.email ) {


      tables.updateOne({'dest':data.dest[number] }, {'$set': {
        'dest.$.accept': 'accept'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_place")
}


exports.getPlaceRefuse=(req,res,next)=>{

  tables.find().select("email lastNameA firstNameA  phone  dest").then(data=>{

    res.render("admin/display_place",{
      data:data
  

    })

})


}

exports.postPlaceRefuse= async(req,res,next)=>{
  const accepting="accept"
  var email=req.body.email
  var number3=req.body.number3



  const useraccepting =await tables.findOne({email:email}).select("dest email")
.then(data=>{

    if (email==req.body.email ) {


      tables.updateOne({'dest':data.dest[number3] }, {'$set': {
        'dest.$.accept': 'refuse'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_place")
}



exports.getPlaceWait=(req,res,next)=>{

  tables.find().select("email lastNameA firstNameA  phone  dest").then(data=>{

    res.render("admin/display_place",{
      data:data
  

    })

})


}

exports.postPlaceWait= async(req,res,next)=>{
  const accepting="accept"
  var email=req.body.email
  var number2=req.body.number2



  const useraccepting =await tables.findOne({email:email}).select("dest email")
.then(data=>{

    if (email==req.body.email ) {


      tables.updateOne({'dest':data.dest[number2] }, {'$set': {
        'dest.$.accept': 'wait'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_place")
}














exports.getadminEquip=(req,res,next)=>{

  tables.find().select("email lastNameA firstNameA  phone  tools").then(equipment=>{

    res.render("admin/display_Equip",{
      equipment:equipment
  

    })

})


}

exports.getEquipAccept=(req,res,next)=>{
  tables.find().select("email lastNameA firstNameA  phone  ").then(tables=>{
    

    res.render("admin/accept_group")
  
})
  
 }


 exports.postEquipAccept= async(req,res,next)=>{
  const accepting="accept"
  var email=req.body.email
  var number=req.body.number



  const useraccepting =await tables.findOne({email:email}).select("tools email")
.then(data=>{

    if (email==req.body.email ) {


      tables.updateOne({'tools':data.tools[number] }, {'$set': {
        'tools.$.accept': 'accept'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_Equip")
}




exports.getEquipRefuse=(req,res,next)=>{
  tables.find().select("email lastNameA firstNameA  phone  ").then(tables=>{
    

    res.render("admin/accept_group")
  
})
  
 }


 exports.postEquipRefuse= async(req,res,next)=>{

  var email=req.body.email
  var number3=req.body.number3



  const useraccepting =await tables.findOne({email:email}).select("tools email")
.then(data=>{

    if (email==req.body.email ) {


      tables.updateOne({'tools':data.tools[number3] }, {'$set': {
        'tools.$.accept': 'refuse'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_Equip")
}



exports.getEquipWait=(req,res,next)=>{
  tables.find().select("email lastNameA firstNameA  phone  ").then(tables=>{
    

    res.render("admin/accept_group")
  
})
  
 }


 exports.postEquipWait= async(req,res,next)=>{

  var email=req.body.email
  var number2=req.body.number2



  const useraccepting =await tables.findOne({email:email}).select("tools email")
.then(data=>{

    if (email==req.body.email ) {


      tables.updateOne({'tools':data.tools[number2] }, {'$set': {
        'tools.$.accept': 'wait'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_Equip")
}























exports.getadminCourse=(req,res,next)=>{



  tables.find().select("email  phone courses firstNameA lastNameA inst").then(data=>{


    res.render("admin/display_Course",{
      data:data
  

    })

})






}




exports.getCourseAccept=(req,res,next)=>{
  tables.find().select("email lastNameA firstNameA  phone  ").then(tables=>{
    

    res.render("admin/accept_group")
  
})
  
 }


 exports.postCourseAccept= async(req,res,next)=>{
  const accepting="accept"
  var email=req.body.email
  var number=req.body.number



  const useraccepting =await tables.findOne({email:email}).select("courses email")
.then(data=>{

    if (email==req.body.email ) {

      console.log(data.courses[number]);

  

      const acceptCourse=data.courses[number].accept

      console.log(acceptCourse);
      console.log(data.courses[number]);

      const tets=data.courses[number]

      tables.updateOne({'courses':data.courses[number] }, {'$set': {
        'courses.$.accept': 'accept'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_Course")
}



exports.getCourseWait=(req,res,next)=>{
  tables.find().select("email lastNameA firstNameA  phone").then(data=>{

  
  res.render("admin/wait_group")

})

}


exports.postCourseWait= async(req,res,next)=>{
  const accepting="wait"
  var email=req.body.email
  var number2=req.body.number2



  const useraccepting =await tables.findOne({email:email}).select("courses email")
.then(data=>{

    if (email==req.body.email ) {

      console.log(data.courses[number2]);

  

      const acceptCourse=data.courses[number2].accept

      console.log(acceptCourse);
      console.log(data.courses[number2]);

      const tets=data.courses[number2]

      tables.updateOne({'courses':data.courses[number2] }, {'$set': {
        'courses.$.accept': 'wait'
    }}, function(err) { 
      console.log(err);
    })


      }

          })


          res.redirect("display_Course")
}



exports.getCourseRefuse=(req,res,next)=>{
  tables.find().select("accept").then(data=>{

  
  res.render("admin/refuse_group")

})

}


exports.postCourseRefuse= async(req,res,next)=>{
  const accepting="refuse"
var email=req.body.email
var number3=req.body.number3



const useraccepting =await tables.findOne({email:email}).select("courses email").then(data=>{

  console.log(data);
  if (email==req.body.email ) {
 

    tables.updateOne({'courses':data.courses[number3] }, {'$set': {
      'courses.$.accept': 'refuse'
  }}, function(err) { 
    console.log(err);
  })

     

      

    }


   
        })


        res.redirect("display_Course")
}

////////


exports.getadminUsers=(req,res,next)=>{




  samvHajjUsers.find().select("firstName_En middleName_En lastName_En firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_users",{
      users:users,
  

    })

})

}

exports.getadminUsersAccept=(req,res,next)=>{




  samvHajjUsers.find({accept:"accept"}).select("firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_usersAccept",{
      users:users,
  

    })

})








}

exports.getadminUsersRefuse=(req,res,next)=>{




  samvHajjUsers.find({accept:"refuse"}).select("firstName_En middleName_En lastName_En firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_usersRefuse",{
      users:users,
  

    })

})








}



exports.getadminUsersWait=(req,res,next)=>{




  samvHajjUsers.find({accept:"wait"}).select("firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept  ").then(users=>{

    res.render("admin/display_usersWait",{
      users:users,
  

    })

})

}


exports.postadminUsersWait=async(req,res,next)=>{

  const accepting="wait"
    var email=req.body.email



    const useraccepting =await samvHajjUsers.findOne({email:email}).select("accept email").then(data=>{

      console.log(data);
      if (email==req.body.email ) {
      samvHajjUsers.updateOne({email:data.email},{accept:accepting}).then(update=>{
  
    console.log(update);
    
    
          }).then(result => {
             
       
    
      
          }) .catch(err => {
            console.log(err);

          });
         
  
          

        }

     
        return transporter.sendMail({
          to:email,
          from:"dmet@dmet.edu.sa",
          subject:"succeed",
          html:"<h1> مبروك انقبلت </h1>"
        })

       
            })
  
  
            res.redirect("display_usersWait")

}










     exports.getRefuse=(req,res,next)=>{
      samvHajjUsers.find().select("accept").then(data=>{

    
        res.render("admin/refuse_users")
      
    })
      
     }


     exports.postRefuse= async(req,res,next)=>{
      const accepting="refuse"
      const email= req.body.email


  
      var userEditing = await samvHajjUsers.findOne({email:email}).select("accept email").then(data=>{
    

        console.log(userEditing);

        if (data.email==req.body.email ) {
      
          console.log(data);
       samvHajjUsers.updateOne({email:data.email},{accept:accepting}).then(update=>{
    
            console.log(update);
        

            

      
                  }).then(result => {
             
       
    
      
                  }) .catch(err => {
                    console.log(err);
        
                  });


                  return transporter.sendMail({
                    to:email,
                    from:"dmet@dmet.edu.sa",
                    subject:"succeed",
                    html:"<h1> م انقبلت  </h1>"
                  })
                 
          
              

    
        }

    
      
    

    
  
              })
    
    
              res.redirect("display_users")
  }





  exports.getAccept=(req,res,next)=>{
    samvHajjUsers.find().select("accept").then(data=>{

  
      res.render("admin/accept_users")
    
  })
    
   }


   exports.postAccept= async(req,res,next)=>{
    const accepting="accept"
    var email=req.body.email



    const useraccepting =await samvHajjUsers.findOne({email:email}).select("accept email").then(data=>{

      console.log(data);
      if (email==req.body.email ) {
      samvHajjUsers.updateOne({email:data.email},{accept:accepting}).then(update=>{
  
    console.log(update);
    
    
          }).then(result => {
             
       
    
      
          }) .catch(err => {
            console.log(err);

          });
         
  
          

        }

     
        return transporter.sendMail({
          to:email,
          from:"dmet@dmet.edu.sa",
          subject:"succeed",
          html:"<h1> مبروك انقبلت </h1>"
        })

       
            })
  
  
            res.redirect("display_users")
}




exports.getWait=(req,res,next)=>{
  samvHajjUsers.find().select("accept").then(data=>{


    res.render("admin/wait_users")
  
})
  
 }


 exports.postWait= async(req,res,next)=>{
  const accepting="wait"
  var email=req.body.email



  const useraccepting =await samvHajjUsers.findOne({email:email}).select("accept email").then(data=>{

    console.log(data);
    if (email==req.body.email ) {
    samvHajjUsers.updateOne({email:data.email},{accept:accepting}).then(update=>{

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


  samvHajjUsers.find({accept:"accept"}).select("firstName_Ar middleName_Ar lastName_Ar email identity_id SCFHS nationality EducationLevel  phone url_video accept").then(data=>{


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