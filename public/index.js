$(document).ready(function() {
  //variables to keep track of current article
  let posts = [];
  let currentPost = 0;

//get all the articles
  $.get("/articles").then(data => {
    posts = data;
  });

  //function to update the article and comments on the page
  const updatePage = () => {
    const id = posts[currentPost]._id;
    $.get(`/comments/${id}`).done(data => {
      $("#title").html(posts[currentPost].title)
      $("#link").attr("href", posts[currentPost].link)
      $("#comments").children("ul").html(data.comments.map(event => $("<li>").text(event.comment)))
    })
  }

  //post new comment to database and to comments section
  $("#addCommentButton").click(event => {
    const comment = $("#newComment").val().trim();
    const id = posts[currentPost]._id;


    $.post("/", {
      comment,
      id
    }, data => {
      $("#comments").children("ul").append("<li> " +
        data.comment +
        "</li>")
      $("#newComment").val("");
    })
  })

  //go to next article
  $("#next").click(event => {
    if (currentPost < posts.length) {
      currentPost++;
      updatePage();
    }
  })
// go to previous article
  $("#prev").click(event => {
    if (currentPost > 0) {
      currentPost--;
      updatePage();
    }
  })

  //delete comments and empty comment section
  $("#deleteCommentsButton").click(event => {
    $.ajax({
      method: "DELETE",
      data: {
        id: posts[currentPost]._id
      }
    }).then(data => {
      $("#comments").empty()
    })
  })
})

