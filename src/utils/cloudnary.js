import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


cloudinary.config({ 
    cloud_name:  process.env.CLOUDNARY_NAME,
    api_key:  process.env.CLOUDNARY_API,
    api_secret: process.env.CLOUDNARY_API_SECRET
});


const uploadonCLoudnary = async (localfilepath) =>{
          try {
            if(!localfilepath) return null;

            const response = await cloudinary.uploader.upload(localfilepath,{
                resource_type : "auto"
            })
            console.log("file uploaded succesfully on cloudnary", response.url)
            //fs.unlinkSync(localfilepath)
             return response;

          } catch (error) {
              fs.unlinkSync(localfilepath)
              return null
          }
}

export {uploadonCLoudnary}