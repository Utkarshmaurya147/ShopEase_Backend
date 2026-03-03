const { User } = require("../models");
const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Get All Users

const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.findAll({attributes: { exclude: ['password'] }});
        if(!users || users.length === 0){
            return res.status(404).json({success: false, message: "No User Found"});
        }
        return res.status(200).json({success:true, message: "Fetched All Users", users});
    } catch (error) {
        console.log("Error in Fetching all users", error);
        return res.status(500).json({success: false, message:"Error in Fetching all users", error: error.message});
    }
}

// Get Single User
const getSingleUser = async (req, res) => {
    const {id} = req.params;
    try {
        const user = await UserModel.findByPk(id,{
            attributes: { exclude: ['password']}
        });
        if(!user){
            return res.status(404).json({success: false, message: "No User Found"});
        }
        return res.status(200).json({success:true, message: "Fetched requested Users", user});

    } catch (error) {
        console.log("Error in Fetching user", error);
        return res.status(500).json({success: false, message:"Error in Fetching single users", error: error.message});  
    }
}

// Delete User
const deleteUser = async (req, res) => {
     const {id} = req.params;
    try {
       const deletedRows = await User.destroy({
            where: { id }
        });
        if(deletedRows === 0){
            return res.status(404).json({success: false, message: "No User Deleted"});
        }
        return res.status(200).json({success:true, message: "User deleted Successfully"});

    } catch (error) {
        console.log("Error in Deleting user", error);
        return res.status(500).json({success: false, message:"Error in deleting users", error: error.message});  
    }
}

//Update
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, password, phone, address} = req.body;

    try {
        // Check if user exists
        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Prepare update data
        let updateData = {
            name: name || user.name, 
            address: address !== undefined ? address : user.address,
            phone: phone !== undefined ? phone : user.phone
        };

        // Handle password change (if provided)
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Perform the update
        await user.update(updateData);

        // Fetch updated user without password for the response
        const updatedUser = await UserModel.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error in Updating user:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error in updating user", 
            error: error.message 
        });
    }
};

// password Controller
const changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;
        const user = await User.findByPk(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Current password in Incorrect"});
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {getAllUsers, getSingleUser, deleteUser, updateUser, changePassword};