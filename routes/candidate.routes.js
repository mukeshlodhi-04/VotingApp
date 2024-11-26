const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("./../models/user.models")
const Candidate = require("./../models/candidate.models");
const jwtAuthMiddleware = require("./../jwt");



const isAdmin = async(userId) => {
    try {
        const user = await User.findById(userId);
        return user.role == 'admin';
    } catch (error) {
        return false;
    }
}

// Candidate Route
router.post("/",jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await isAdmin(req.user.id)){
            return res.status(403).json({message: "user is not admin "})
        }
        const data = req.body;
       
        const newcandidate = new Candidate(data);
        const response = await newcandidate.save()

        res.status(201).json({ message: "Candidatea created",Candidate: response});
    } catch (error) {
        console.error("Error in signup:", error.message);
        res.status(400).json({ message: "Unable to create user" });
    }
});



// Update the candidate Route
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        // Check if user has admin privileges
        if (!isAdmin(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateID = req.params.candidateID; // Correct parameter
        const updatedCandidateData = req.body; // Updated data for the candidate

        // Validate candidate ID
        if (!candidateID.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid Candidate ID' });
        }

        // Update the candidate
        const response = await Candidate.findByIdAndUpdate(
            candidateID,
            updatedCandidateData,
            {
                new: true, // Return the updated document
                runValidators: true, // Run schema validation
            }
        );

        if (!response) {
            console.error(`Candidate with ID ${candidateID} not found`);
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated:', response);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error updating candidate:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete("/:candidateId",jwtAuthMiddleware,async (req, res) => {
    try {
        if(! await isAdmin(req.user.id)){
            return res.status(403).json({message: "user is not admin "})
        }
        const candidateId = req.params.id;
        // Fetch user from database
        const response = Candidate.findByIdAndDelete(candidateId)

        if(!response){
            res.status(404).json({ message: "candidate not found" });
        }
        res.status(200).json({message: "candidate is deleted"})
    
    } catch (error) {
        console.error("Error updating password:", error.message);
        res.status(500).json({ message: "error while deleting the candidate " });
    }
});

router.post('/vote/:candidateId',jwtAuthMiddleware, async(req,res) =>{
    const candidateID = req.params.candidateId;
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return req.status(500).json({message: "candidate not foundf"})
        }
        const user = await User.findById(userId);
        if(!user){
            return req.status(500).json({message: "user not found"})
        }
        if(user.isVoted){
            return req.status(500).json({message: "you have already voted"});
        }
        if(user.role == 'admin'){
            return req.status(500).json({message: "admin can't vote"})
        }

        candidate.votes.push({user: user.id});
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();
    } catch (error) {
        console.error("Error updating password:", error.message);
        res.status(500).json({ message: "error while voting" });
    }
})

router.get('vote/count',async(req,res) =>{
    try {
        const candidate = Candidate.find().sort({voteCount:'desc'});
        const voteRecord = candidate.map((data) =>{
            return {
                party: data.party,
                votes: data.voteCount
            }
        });
        return res.status(500).json(voteRecord);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error" });
    }
})




module.exports = router;


