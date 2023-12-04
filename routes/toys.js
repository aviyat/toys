const express = require("express");
const { auth } = require("../middlewares/auth");
const { ToyModel, validateToy } = require("../models/toyModel")
const router = express.Router();

router.get("/", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 10) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await ToyModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse })
    res.json(data);
  }

  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }

})

router.get("/search", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 10) || 10;
    let page = req.query.page || 1;
  try {
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS, "i")
    let data = await ToyModel.find({
      $or: [
        { name: searchReg },
        { description: searchReg }
      ]
    })
      .limit(perPage)
      .skip((page - 1) * perPage);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

router.get("/category/:category", async (req, res) => {
  let category = req.params.category;
  let perPage = Math.min(req.query.perPage, 10) || 10;
  let page = req.query.page || 1;

  try {
    let data = await ToyModel.find({ category: category })
      .limit(perPage)
      .skip((page - 1) * perPage);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

router.get("/single/:_idToy", async (req, res) => {
  try {
    let getId = req.params._idToy;
    let data;
    data = await ToyModel.find({ _id: getId })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error, try again", err })
  }
})

router.get("/price", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 10) || 10;
  const minP = req.query.min;
  const maxP = req.query.max;
  try {
    let data;
    if (minP && maxP) {
      data = await ToyModel.find({ price: { $gte: minP, $lte: maxP } });
      res.json(data);
    }
    else if (minP) {
      data = await ToyModel.find({ price: { $gte: minP } });
      res.json(data);
    }
    else if (maxP) {
      data = await ToyModel.find({ price: { $lte: maxP } });
      res.json(data);
    }
    else {
      data = await ToyModel.find({});
      res.json(data);
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.post("/", auth, async (req, res) => {
  let validBody = validateToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let toy = new ToyModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again ", err })
  }
})

router.put("/:editId", auth, async (req, res) => {
  let validBody = validateToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  let editId = req.params.editId;
  try {
    let data;
    let status;
    if (req.tokenData.role == "admin") {
      data = await ToyModel.updateOne({ _id: editId }, req.body)
      status = [{
        status: "200 succes",
        msg: "admin update"
      }]
    }
    else {
      data = await ToyModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
      status = [{
        status: "200 success",
        msg: "user update"
      }]
    }
    if (data.modifiedCount == 0) {
      data = [{
        msg: "error, you not update nothing or this toy not belong to you, try again!!"
      }];
      status = [{
        status: "401 failed",
        msg: "enable update"
      }]
    }
    res.json([{ data, status }]);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error, try again", err })
  }
})

router.delete("/:delId", auth, async (req, res) => {
  try {
    let delId = req.params.delId;
    let data, status;
    if (req.tokenData.role == "admin") {
      data = await ToyModel.deleteOne({ _id: delId });
    }
    else {
      data = await ToyModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
    }
    if (data.modifiedCount == 0) {
      data = [{
        msg: "error, the toy not exist or this toy not belong to you, try again!!"
      }];
      status = [{
        status: "401 failed",
        msg: "enable update"
      }]
    }
    res.json([{ status, data }]);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error, try again", err })
  }
})

module.exports = router;