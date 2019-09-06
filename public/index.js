$(_ => {
  let posts = [];
  let currentPost = 0;


  $.get("/articles").then(data => {
    posts = data;
  });

  const updatePage = () => {
    const id = posts[currentPost]._id;

    $.get(`/comments/${id}`).then(data => {
      $("#title").html(posts[currentPost].title)
      $("#link").attr("href", posts[currentPost].link).
      $("#comments").html(data.map(event => event.comment))
    })
  }

  $("#addCommentButton").click(event => {
    const comment = $("#newComment").val().trim();
    const id = posts[currentPost]._id;


    $.post("/", {
      comment,
      id
    }, data => {
      $("#comments").append(`${data.comment}<br/>`)
      $("#newComment").val("");
    })
  })

  $("#next").click(event => {
    if (currentPost < posts.length) {
      currentPost++;
      updatePage();
    }
  })

  $("#prev").click(event => {
    if (currentPost > 0) {
      currentPost--;
      updatePage();
    }
  })

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
});