const User = require('../models/userModel');

// Controller function to create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, address } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Create a new user instance
        const newUser = new User({
            name,
            email,
            address
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Respond with the saved user
        res.status(201).json({ message: 'User created successfully', user: savedUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error while creating user' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Server error while fetching user' });
    }
}


exports.searchUsers = async (req, res) => {
    try {
        console.log('Search query:', req.query.query);
        const query = req.query.query?.trim() || '';
        if (!query) {
            return res.json(400).json({ message: 'Query parameter is required' });
        }

        //limit query length to prevent abuse
        if (query.length > 50) {
            return res.status(400).json({ message: 'Query parameter is too long' });
        }

        // Perform a case-insensitive search on name and email fields
        const searchRegex = new RegExp(`^${query}`, 'i');

        const users = await User.find({
            $or: [
                { name: { $regex: searchRegex } },
                { email: { $regex: searchRegex } },
                { address: { $regex: searchRegex } }
            ]
        }).select('-__v')  // Exclude __v field
        .limit(20);

        res.status(200).json({ users });

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error while searching users' });
    }
}

exports.getPaginatedUsers = async (req, res) => { 
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
        const skip = (page-1) * limit;
        const sortBy = req.query.sortBy || 'createdAt'; // Default sort by createdAt
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Default to ascending order
        const users = await User.find().sort({[sortBy]: sortOrder})
        .skip(skip)
        .limit(limit);

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);
        res.json({
            data: users,
            meta: {
                page,limit,
                totalItems: totalUsers,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching paginated users:', error);
        res.status(500).json({ message: 'Server error while fetching paginated users' });
    }
}

exports.searchAndPaginatedUsers = async (req, res) => {
    try {
       const { query ='', page =1, limit=10, sortBy='createdAt', sortOrder ='desc' } = req.query;

       const pageNum = Math.max(1, parseInt(page));
       const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

       const searchConditions = query ? {
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { address: { $regex: query, $options: 'i' } }
        ]
    }: {}   

    const [users, total] = await Promise.all([
        User.find(searchConditions).sort({ [sortBy]: sortOrder ==='desc' ? -1 : 1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
        User.countDocuments(searchConditions)
    ]);
    return res.json({   
        success: true,
        data: users,
        meta: {
            page: pageNum,
            limit: limitNum,
            totalItems: total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum * limitNum < total,
            hasPrevPage: pageNum > 1
        }
    });
    } catch (error) {
        console.error('Error searching and paginating users:', error);
        res.status(500).json({ message: 'Server error while searching and paginating users' });
    }   
}

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, address } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (address) user.address = address;

        const updatedUser = await user.save();
        const userResponse = updatedUser.toObject();
        res.status(200).json({ message: 'User updated successfully', user: userResponse });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
}

exports.deleteMultipleUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'userIds must be a non-empty array' });
        }

        const deleteResult = await User.deleteMany({ _id: { $in: userIds } });
        res.status(200).json({ message: `${deleteResult.deletedCount} users deleted successfully` });
    } catch (error) {
        console.error('Error deleting multiple users:', error);
        res.status(500).json({ message: 'Server error while deleting multiple users' });
    }
}