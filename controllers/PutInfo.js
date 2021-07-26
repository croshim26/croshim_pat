

const fs = require('fs');
const path = require('path');


const tables = require('../models/tables');

exports.getPlacesLessor=(req,res,next)=>{   
  
 


  tables.findById(req.session.tables._id).select("firstNameA lastNameA dest phone roomImage ").then(data =>{

        res.render("PutInfo/PutPlaceLessor/places_lessor",{
          
          dest:data,
          foo:data,
          main_build:true,
          main_equip:true,
          courses:true,  

          account_build:true,
          
          add_build:true,
          add_eq:false,
          del_build:true,
          add_course:false,
          message32:message32,
          message2:message2
                  
       
          
         })
        //  console.log(data.dest);

         if(data.dest==""){
          console.log(data.dest);
        }


        })

     

        
}

exports.getAddPlacesLessor=(req,res,next)=>{


  tables.find().select("dest").then(data=>{

    res.render("PutInfo/PutPlaceLessor/add_places_lessor")

  })
console.log(dest);





}


exports.postAddPlacesLessor=(req,res,next)=>{
  const url2=req.body.url;

  tables.findById(req.session.tables._id).select("firstNameA dest").then(data =>{

    for (var index = 0; index < 36; index++) {
      var element = url2[index];
    
    var f =f+element
    
  
    
    }

    
console.log(f);


if(f === "undefinedhttps://www.google.com.sa/maps/place"){

console.log("hhhhhh");

const image =req.file;
console.log(image.path);

// const imageUrl = image.path;

// console.log(req.files.imageUrl);

  data.dest.push({nationality:req.body.nationality,dist:req.body.dist , url:req.body.url,desc:req.body.desc,roomImage:image.path})

}
else{


  console.log("ghjk");
  
}

    data.save();
    

    res.redirect("/places_lessor")

 })

}



exports.getEditPlacesLessor=(req,res,next)=>{


  tables.findById(req.session.tables._id).select("firstNameA lastNameA email phone ").then(data =>{
        
  
  console.log(data);
  
  
  
   
  res.render("PutInfo/PutPlaceLessor/account_places_lessor",{
      dest:data.dest,
          foo:data,
        
          main_build:true,
          main_equip:true,
          courses:true,  

          account_build:true,
          
          add_build:true,
          add_eq:false,
          del_build:true,
          add_course:false,    
     
     
  
    
       })
  
  
      })
  
  }



exports.postEditPlacesLessor=(req,res,next)=>{

    

  tables.findById(req.session.tables._id).select(" lastNameA firstNameA email phone ").then(data =>{
  
    tables.updateOne({firstNameA:data.firstNameA},{firstNameA:req.body.firstNameA}).then(update=>{
  
  
  
      })

      tables.updateOne({lastNameA:data.lastNameA},{lastNameA:req.body.lastNameA}).then(update=>{
  
  
  
      })
  
  
  
      tables.updateOne({email:data.email},{email:req.body.email}).then(update=>{
  
  
  
      })
      

      tables.updateOne({phone:data.phone},{phone:req.body.phone}).then(update=>{
  
  
  
      })
  
  
        
    res.redirect("/places_lessor")
        
    
      })
  
    }


exports.getDeletePlacesLessor=(req,res,next)=>{
  tables.findById(req.session.tables._id).select("dest firstNameA lastNameA").then(data=>{




    res.render('PutInfo/PutPlaceLessor/delete_places_lessor',{
   
  
  
    })

  })



}


exports.postDeletePlacesLessor=(req,res,next)=>{

  const dest=req.body.dest



  tables.findById(req.session.tables._id).select("firstNameA dest").then(data=>{

    for (var i = 0; i < data.dest.length; i++) {      
          var filtered = data.dest.filter(function(value, index, arr){ 
            return index !=dest;
          })

  
        }

         tables.updateOne({dest:data.dest},{dest:filtered}).then(update=>{

  
         
  
        });

        return data.save();
          }).then(result => {
           
            
           
  
    
          }) .catch(err => {
            console.log(err);
          });

          res.redirect("/places_lessor")

};





exports.getAdd_courses=(req,res,next)=>{
res.render("PutInfo/PutPhotographer/add_courses")

}


exports.postAdd_courses=(req,res,next)=>{

  tables.findById(req.session.tables._id).select("firstNameA  courses").then(data =>{
    
  
    
        

    console.log(data.courses);
   
    
    console.log("hhhhhh");
    

    
      data.courses.push({CourseName:req.body.CourseName,titlesCourse:req.body.titlesCourse,courseCondeitions:req.body.courseCondeitions , begining:req.body.begining,ending:req.body.ending,place:req.body.place,city:req.body.city})

        data.save();
        

    
     })

  res.redirect("/courses")

}
    


exports.getCourses=(req,res,next)=>{
  
  tables.findById(req.session.tables._id).select("courses").then(data =>{
  
  

    res.render("PutInfo/PutPhotographer/courses",{
      data:data,
      main_build:true,
      main_equip:true,
      courses:true,  

      account_build:true,
      
      add_build:false,
      add_eq:false,
      del_build:true,
      add_course:true,      
   
   
    })
  
  })

  
}





exports.getDeleteCourse=(req,res,next)=>{
  
  tables.findById(req.session.tables._id).select("tools").then(data=>{

    
    res.render("PutInfo/PutPhotographer/delete_course")
  
})



}



exports.postDeleteCourse=(req,res,next)=>{

  const courses=req.body.courses



  tables.findById(req.session.tables._id).select("courses").then(data=>{

  


    for (let i = 0; i < data.courses.length; i++) {      
          var filtered = data.courses.filter(function(value, index, arr){ 
            return index !=courses;
          })

        
        }

        tables.updateOne({courses:data.courses},{courses:filtered}).then(update=>{

  
        })
       


          })

          res.redirect("/courses")



}

exports.getEquipment=(req,res,next)=>{
  tables.findById(req.session.tables._id).select("email lastNameA firstNameA  phone tools").then(data =>{

    res.render("PutInfo/PutEquipments/Equipment_seller",{
          foo:data,
          main_build:true,
          main_equip:true,
          courses:true,  
    
          account_build:true,
          
          add_build:false,
          add_eq:true,
          del_build:true,
          add_course:false,           
             
           
     
          
          
    
      
         })
    
    
        })
    
    }
  


    



    exports.getAdd_eq=(req,res,next)=>{


      tables.find().select("dest").then(data=>{
    
        res.render("PutInfo/PutEquipments/add_equipment",{

        }
       
        
        )
    
      })
    console.log(dest);
    
    
    
    
    
    }
    
    
    exports.postAdd_eq=(req,res,next)=>{
    
   
    
      tables.findById(req.session.tables._id).select("firstNameA  tools").then(data =>{
    console.log("hhhhhh");
    
    const image =req.file;
    console.log(image.path);
  
    
      data.tools.push({city:req.body.city,catagory:req.body.catagory,NameMachine:req.body.NameMachine , NameCompany:req.body.NameCompany,roomImage:image.path})
    
        data.save();
        
    
        res.redirect("/Equipment_seller")
    
     })
    
    }
    

    exports.getEq_edit=(req,res,next)=>{


      tables.findById(req.session.tables._id).select("email lastNameA firstNameA catagory NameMachine phone tools ").then(data =>{
          
    
    console.log(data);
    
    
    
     
    res.render("PutInfo/PutEquipments/equipment_edit",{
          foo:data, 
          main_build:true,
          main_equip:true,
          courses:true,  
    
          account_build:true,
          
          add_build:false,
          add_eq:true,
          del_build:true,
          add_course:false,         
       


    
    
      
         })
    
    
        })
    
    }
    
    
    
    
    
    exports.postEq_edit=(req,res,next)=>{
    
      tables.findById(req.session.tables._id).select("firstNameA email lastNameA phone").then(data =>{
    
        tables.updateOne({firstNameA:data.firstNameA},{firstNameA:req.body.firstNameA}).then(update=>{
    
    
    
        })
    
    
        tables.updateOne({email:data.email},{email:req.body.email}).then(update=>{
    
    
    
        })



        tables.updateOne({lastNameA:data.lastNameA},{lastNameA:req.body.lastNameA}).then(update=>{
    
      
    
    
        })


        tables.updateOne({phone:data.phone},{phone:req.body.phone}).then(update=>{
    
    
    
        })
        
    
    
          
      res.redirect("/Equipment_seller")
          
      
        })
    
      }


     exports.getDeleteEquipment=(req,res,next)=>{
      tables.findById(req.session.tables._id).select("tools").then(data=>{

    
        res.render("PutInfo/PutPlaceLessor/delete_Equipment_seller")
      
    })
      
     }


     exports.postDeleteEquipment=(req,res,next)=>{
      const tools=req.body.tools



      tables.findById(req.session.tables._id).select("tools").then(data=>{
    
      
    
    console.log(tools);
        for (let i = 0; i < data.tools.length; i++) {      
              var filtered = data.tools.filter(function(value, index, arr){ 
                return index !=tools;
              })
    
            
            }
    
            tables.updateOne({tools:data.tools},{tools:filtered}).then(update=>{
    
      console.log(update);
      
            })
           
    
    
              })
    
    
              res.redirect("Equipment_seller")
  }


///////////
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};




