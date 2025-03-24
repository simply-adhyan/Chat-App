import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"


export const signup = async (req,res) => {
    const{fullName,email,password}=req.body;
    try {
        console.log("Received Request Body:", req.body);
        if (![fullName, email, password].every(Boolean)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        

        //password length
        if (password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"}); 
        }

        //user check
        const user =  await User.findOne({email});
        if (user) return res.status(400).json({message:"Email already exists"});

        
        
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName:fullName,
            email:email,
            password:hashedPassword
        })



        if(newUser){
            //generate jwt token here
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email: newUser.email,
                profilePic:newUser.profilePic,

            });


        }else{
            res.status(400).json({message:"Invalid User Data"});
            
        }


    } catch (error) {
        
        console.log("Error in signup Controller : ",error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};
export const login = async (req,res)=>{
    const{email,password}=req.body;

    try {
        const user = await User.findOne({email})

        if (!user){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        
        generateToken(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email: user.email,
            profilePic:user.profilePic,

        });

    } catch (error) {
                
        console.log("Error in login Controller : ",error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}
export const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge: 0})
        return res.status(200).json({message:"Logged Out Sucsessfully"});
        
    } catch (error) {
        console.log("Error in Logout Controller : ",error.message);
        res.status(500).json({message: "Internal Server Error"});
        
    }
};

export const updateProfile = async (req, res) => {
    const { profilePic } = req.body;
    const userId = req.user._id;

    try {
        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // Validate that the image is Base64
        if (!/^data:image\/(png|jpe?g|gif);base64,/.test(profilePic)) {
            return res.status(400).json({ message: "Invalid image format. Only PNG, JPG, and GIF are allowed." });
        }

        let uploadResponse;
        try {
            uploadResponse = await cloudinary.uploader.upload(profilePic, {
                folder: "user_profiles",  // Organize uploads into a specific folder
                allowed_formats: ["jpg", "jpeg", "png", "gif"], // Restrict file types
                transformation: [{ width: 500, height: 500, crop: "limit" }], // Limit image size
            });
        } catch (cloudinaryError) {
            console.error("Cloudinary upload error:", cloudinaryError);
            return res.status(500).json({ message: "Image upload failed. Please try again later." });
        }

        // Update user profile picture in database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePic: uploadResponse.secure_url } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateProfile controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req,res) =>{
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - User not authenticated" });
        }
        
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in CheckAuth controller : ",error.message);
        res.status(500).json({message: "Internal Server Error"});
        
    }
};