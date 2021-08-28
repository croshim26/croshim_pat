
const tables = require("../models/tables");

exports.getDisplayEquipments=(req,res,next)=>{
    tables.find().select("email lastNameA firstNameA catagory NameMachine phone tools").then(equipment=>{

        res.render("displayInfo/displayEquipment",{
            equipment:equipment,
            place:false,
            place_s:false,
            info_s:true,
            info:true,
            person:false,
            person_s:false,

        })

    })


}

exports.postDisplayEquipments=(req,res,next)=>{

    const catagory =req.body.catagory
  
    tables.find().select("email lastNameA firstNameA catagory NameMachine phone tools").then(equipment=>{


        res.render("displayInfo/Searching_displayEquipment",{
            equipment:equipment,
            catagory:catagory,
            place:false,
            place_s:false,
            info_s:true,
            info:true,
            person:false,
            person_s:false


          
         
        })

    })


  }


exports.getDisplayPlace=(req,res,next)=>{

    tables.find().select("firstNameA lastNameA dest phone roomImage ").then(data=>{
        res.render("displayInfo/displayPlace",{
            data:data,
            person:false,
            person_s:false,
            place:true,
            place_s:true,
            info_s:false,
            info:false,
            
        })
    })

}


exports.postDisplayPlace=(req,res,next)=>{

    const nat =req.body.nationality
  
    const dest =req.body.dist
  
  
    tables.find().select("firstNameA lastNameA dest  phone ").then(data=>{
  
      
  
  
  
      res.render("displayInfo/Searching_displayPlace",{
        data:data,
        nat:nat,
        dest:dest,
        place:true,
        place_s:true,
        info_s:false,
        info:false,
        person:false,
        person_s:false
     
  
      })
  
 
  
  })
  
  
  
  }


  exports.getDisplayCourses=(req,res,next)=>{


    tables.find().select("phone courses firstNameA lastNameA inst ").then(data=>{

        console.log(data.dest);
                res.render("displayInfo/displayCourses",{
                    data:data,
                    person_s:false,
                    place_s:false,
                    info_s:false,

                    
                })
            })
        
  }


exports.getChoice=(req,res,next)=>{

    res.render("displayInfo/choice")

}










 



