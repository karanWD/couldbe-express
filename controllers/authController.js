export const login = async (req,res) => {

}

export const signup = async (req,res) => {
  console.log(req.body)
  res.status(200).json({message:"DONE"})
}