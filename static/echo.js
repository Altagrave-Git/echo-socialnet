$(document).ready(function () {
  console.log("jQuery initialized.");
});

// RETRIEVE AUTHENTICATION STATUS //
const authRetrieve = $.get("/ajax/", { action: "auth" });

function auth() {
  return authRetrieve.responseJSON.status;
}

// GENERATE CSRF TOKEN //
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie("csrftoken");



function interactive(method, url, action, instance) {
  $.ajax({
    type: method,
    url: url,
    data: {
      csrfmiddlewaretoken: csrftoken,
      instance: instance,
      action: action,
    },
    dataType: "json",
    success: function (data) {
      console.log(data);
      if (data["status"] == "liked") {
        $(`#${data.uuid}`).find(".post-like").addClass("active");
        val = Number($(`#${data.uuid}`).find(".post-like-count").text()) + 1;
        $(`#${data.uuid}`).find(".post-like-count").text(val);
      }
      if (data["status"] == "unliked") {
        $(`#${data.uuid}`).find(".post-like").removeClass("active");
        val = Number($(`#${data.uuid}`).find(".post-like-count").text()) - 1;
        if (val == 0) {
          $(`#${data.uuid}`).find(".post-like-count").text('');
        } else {
          $(`#${data.uuid}`).find(".post-like-count").text(val);
        }
      }
      if (data["status"] == "posts_retrieved") {
        removePosts();
        renderPosts(data);
      }
      if (data['status'] == "replies_retrieved") {
        renderPosts(data);
      }
    },
    failure: function () {
      console.log("failure");
    },
  });
}

function removePosts() {
  if (document.querySelector(".post-container")) {
    currentPosts = document.querySelectorAll(".post-container");
    for (let post of currentPosts) {
      post.parentElement.remove();
    }
  }
}

function renderPosts(data) {
  if (data['status'] == 'replies_retrieved') {
    $(".post-reply-form").remove();
  }

  for (let post of data['post_list']) {
    let user = post['echouser'];
    let userID = post['echouser_id'];
    let avatar = post['avatar']
    let postID = post['post_id'];
    let content = post['post'];
    let whenPosted = post['when_posted'];
    let numLikes = post['num_likes'];
    let numReplies = post['num_replies']
    let liked = post['liked'];
    let replyToName = post['reply_to_name']
    let replyToID = post['reply_to_id']
    let altNumLikes, altNumReplies;

    if (numReplies == 0) {
      altNumReplies = '';
    } else {
      altNumReplies = numReplies;
    }

    if (numLikes == 0) {
      altNumLikes = '';
    } else {
      altNumLikes = numLikes;
    }

    if (replyToName.length > 0) {
      replyToName = `<div class="post-reply-to">Reply<span>@</span>${post['reply_to_name']}</div>`
    } else {
      replyToName = ''
    }

    if (data["status"] == "replies_retrieved") {
      $(`#${replyToID}`).closest("form").after(`
        <div class='reply-container'>
          ${replyToName}

          <div class='post-avatar'>
            <img class='post-avatar-img' onclick="location.href='/users/profile/${userID}';" src="${avatar}">
          </div>
          <div class='post-body' onclick="location.href='/';">
            <div class='post-source'>
              <div class='post-user'>${user}</div>
              <div class='post-date'>${whenPosted}</div>
              <input type="hidden" name='post-uuid' value="${postID}">
            </div>
            <div class='post-content'>
              <p>${content}</p>
            </div>
          </div>
          <form class='post-actions-form'>
            <div class='post-actions' id="${postID}">
              <div class='post-reply'>
                <div class='post-reply-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z"/>
                  </svg>
                </div>
              </div>
              <div class='post-reply-count'>${altNumReplies}</div>
              <div class='post-repost'>
                <div class="post-repost-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 30 576 432"><path d="M272 416c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32-14.3-32-32V192h32c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-64-64c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l32 0 0 128c0 53 43 96 96 96H272zM304 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32 14.3 32 32l0 128H416c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8l-32 0V192c0-53-43-96-96-96L304 96z"/>
                  </svg>
                </div>
              </div>
              <div class="post-repost-count"></div>
              <div class="post-like${liked}">
                <div class="post-like-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                  </svg>
                </div>
              </div>
              <div class="post-like-count">${altNumLikes}</div>
            </div>
          </form>
        </div>
      `);
    }

    if (data['status'] == 'posts_retrieved') {
      $("section").append(`
        <div class='section-container'>
          <div class='post-container'>

            ${replyToName}

            <div class='post-avatar'>
              <img class='post-avatar-img' onclick="location.href='/users/profile/${userID}';" src="${avatar}">
            </div>

            <div class='post-body' onclick="location.href='/';">
              <div class='post-source'>
                <div class='post-user'>${user}</div>
                <div class='post-date'>${whenPosted}</div>
                <input type="hidden" name='post-uuid' value="${postID}">
              </div>
              <div class='post-content'>
                <p>${content}</p>
              </div>
            </div>

            <form class='post-actions-form'>
              <div class='post-actions' id="${postID}">
                <div class='post-reply'>
                  <div class='post-reply-icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z"/>
                    </svg>
                  </div>
                </div>

                <div class='post-reply-count'>${altNumReplies}</div>

                <div class='post-repost'>
                  <div class="post-repost-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 30 576 432"><path d="M272 416c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32-14.3-32-32V192h32c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-64-64c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l32 0 0 128c0 53 43 96 96 96H272zM304 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32 14.3 32 32l0 128H416c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8l-32 0V192c0-53-43-96-96-96L304 96z"/>
                    </svg>
                  </div>
                </div>

                <div class="post-repost-count"></div>

                <div class="post-like${liked}">
                  <div class="post-like-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                    </svg>
                  </div>
                </div>

                <div class="post-like-count">${altNumLikes}</div>
              </div>
            </form>
          </div>
        </div>
      `);
    }
  }
}




// click() => Generate Reply Textbox //
$(document).on("click", ".post-reply", function() {
  if (auth() == 'user') {
    $(".post-reply-form").each(function (index, element) {
      $(element).remove();
    })
    postID = $(this).closest('.post-actions')[0].id
    $(this).closest('form').after(`
      <form class='post-reply-form' action="/posts/newpost/" method="POST">
        <textarea class='post-reply-box' name="post" maxlength="280" placeholder='Write your reply here...' autocomplete="off" autofocus required></textarea>
        <input name="reply_to" type="hidden" value="${postID}">
        <input name="csrfmiddlewaretoken" type="hidden" value="${csrftoken}">
        <input name="newpath" type="hidden" value="${window.location.href}">
        <input id='post-reply-submit' type='submit' value='Reply'>
      </form>
    `);
  } else { location.href = "/accounts/login/?next=/" }
})

// click() => Render Post Replies //
$(document).on("click", ".post-reply-count:not(.active)", function () {
  $container = $(this).closest(".post-container")
  $(".post-container").not($container).children(".reply-container").remove()
  $(".post-container").not($container).find(".post-reply-count.active").removeClass("active")
  $(this).addClass('active');
  let method = "GET";
  let url = "/ajax/";
  let action = "get_post_replies";
  let instance = $(this).closest('.post-actions')[0].id;
  interactive(method, url, action, instance);
})

$(document).on("click", ".post-reply-count.active", function () {
  $container = $(this).closest(".post-container");
  $(".post-container").not($container).children(".reply-container").remove();
  $(".post-container").not($container).find(".post-reply-count.active").removeClass("active");
  $(this).removeClass("active");
  $(this).closest("form").parent().children(".reply-container").remove()
})

$(document).on("click", ".post-like", function () {
  let method = "POST";
  let url = "/ajax/";
  let action = "like";
  let uuid = $(this).closest('.post-actions')[0].id;
  interactive(method, url, action, uuid);
})

// REMOVE REPLY BOX IF CLICK OUTSIDE PARENT POST //
$(document).on("click", function (event) {
  var $target = $(event.target);
  if (
    !$target.closest(".post-container").length && $(".post-reply-form").is(":visible")
  ) {
    $(".post-reply-form").remove();
  }
});

// PROFILE TABS & POSTS //
if (String(location.pathname).split('/')[2] == 'profile') {
  let method = "GET";
  let url = "/ajax/";
  let action = "get_profile_posts";
  let instance = $(".profile-username").text();
  interactive(method, url, action, instance);
}

$(".profile-posts").on("click", function () {
  let method = "GET";
  let url = "/ajax/";
  let action = "get_profile_posts";
  let instance = $('.profile-username').text();
  interactive(method, url, action, instance);
});

$(".profile-replies").on("click", function () {
  let method = "GET";
  let url = "/ajax/";
  let action = "get_profile_replies";
  let instance = $(".profile-username").text();
  interactive(method, url, action, instance);
});

$(".profile-likes").on("click", function () {
  let method = "GET";
  let url = "/ajax/";
  let action = "get_profile_likes";
  let instance = $(".profile-username").text();
  interactive(method, url, action, instance);
});
