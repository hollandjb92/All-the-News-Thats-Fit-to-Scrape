const mongoose = require("mongoose"),
  Comment = require("./comment");

const articleSchema = new mongoose.Schema({
  title: String,
  date: {
    type: Date,
    default: Date.now
  },
  link: String,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }]
})

articleSchema.pre("remove", async function () {
  await Comment.remove({
    _id: {
      $in: this.comments
    }
  });
});


module.exports = mongoose.model("Article", articleSchema);