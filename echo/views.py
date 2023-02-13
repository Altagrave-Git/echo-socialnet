from django.shortcuts import render
from posts.models import Post
from users.models import EchoUser, Follow
from notifications.models import Alerts
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie


# Main page logic is contained in Echo.JS and Views.AJAX_response
def index(request):
    context = {
        'title': 'Home | Echo Social',
    }

    return render(request, 'echo/index.html', context=context)


@ensure_csrf_cookie
def ajax_response(request):
    if request.method == 'GET':
        print(request.GET)

        if request.GET['action'] == 'auth':
            if request.user.is_authenticated:
                return JsonResponse({
                    'status': 'user',
                    'user': request.user.username
                    })

            else:
                return JsonResponse({
                    'status': 'guest',
                    'user': None
                    })

        posts = Post.objects.order_by('timestamp').reverse().all()
        echouser = request.user
        post_list = list()
        data = {
            'post_list': post_list,
            'status': 'posts_retrieved'
        }

        if request.GET['action'] == 'get_feed_posts':
            posts = Post.objects.order_by('timestamp').reverse().filter(reply_to=None).all()

        if request.GET['action'] == 'get_profile_replies':
            echouser = EchoUser.objects.get(username=request.GET['instance'])
            posts = Post.objects.order_by('timestamp').reverse().filter(
                echouser=echouser.id).all()
            posts = posts.exclude(reply_to=None)

        if request.GET['action'] == 'get_profile_posts':
            echouser = EchoUser.objects.get(username=request.GET['instance'])
            posts = Post.objects.order_by('timestamp').reverse().filter(
                echouser=echouser.id).all()
            posts = posts.filter(reply_to=None)

        if request.GET['action'] == 'get_profile_likes':
            echouser = EchoUser.objects.get(username=request.GET['instance'])
            posts = Post.objects.order_by('timestamp').reverse().filter(
                echouser=echouser.id).all()
            posts = echouser.liked.order_by('timestamp').reverse().all()  # type:ignore

        if request.GET['action'] == 'get_post_replies':
            post_uuid = request.GET['instance']
            posts = Post.objects.get(uuid=post_uuid)
            posts = posts.replies.all()  # type:ignore
            data['status'] = 'replies_retrieved'

        for post in posts:
            post_view = dict()
            post_view['echouser'] = post.echouser.username
            post_view['echouser_id'] = post.echouser.uuid
            post_view['avatar'] = post.echouser.avatar.url
            post_view['post_id'] = post.uuid
            post_view['post'] = post.post
            post_view['when_posted'] = post.when_posted()
            post_view['num_likes'] = post.num_likes()
            post_view['num_replies'] = post.num_replies()
            post_view['num_reposts'] = post.num_reposts()
            post_view['object'] = ['post']

            alt_post_fields = [
                'reply_to_id',
                'reply_to_name',
                'repost_id',
                'repost_avatar',
                'repost_user',
                'repost_time',
                'repost_post'
                ]
            
            for field in alt_post_fields:
                post_view[field] = ''

            try:
                post_view['reply_to_id'] = post.reply_to.uuid#type:ignore
                post_view['reply_to_name'] = post.reply_to.echouser.username#type:ignore
                post_view['object'] = 'reply'
            except:
                pass

            try:
                post_view['repost_id'] = post.repost_of.uuid#type:ignore
                post_view['repost_avatar'] = post.repost_of.echouser.avatar.url#type:ignore
                post_view['repost_user'] = post.repost_of.echouser.username#type:ignore
                post_view['repost_time'] = post.repost_of.when_posted()#type:ignore
                post_view['repost_post'] = post.repost_of.post#type:ignore
                post_view['object'] = 'repost'
            except:
                pass

            if post.likes.filter(username=request.user).exists():
                post_view['liked'] = ' active'

            else:
                post_view['liked'] = ''

            post_list.append(post_view)

        return JsonResponse(data)

    if request.method == 'POST':

        if request.POST['action'] == 'like':
            post = Post.objects.get(uuid=request.POST['instance'])
            uuid = post.uuid
            
            if post.likes.filter(username=request.user).exists():
                post.likes.remove(request.user)
                print('Unliked')
                data = {
                    'status': 'unliked',
                    'uuid': uuid
                }
                return JsonResponse(data)

            else:
                post.likes.add(request.user)
                
                if post.echouser.notifs.filter(type='like', by_user=request.user, post=post).exists() == False:
                    alert = Alerts(type='like', recipient=post.echouser, by_user=request.user, post=post)
                    alert.save()

                data = {
                    'status': 'liked',
                    'uuid': uuid
                }
                return JsonResponse(data)
            
        if request.POST['action'] == 'follow':
            profile = EchoUser.objects.get(uuid=request.POST['instance'])
            echouser = EchoUser.objects.get(uuid=request.user.uuid)
            data = {}

            if Follow.objects.filter(echouser=echouser, follow=profile).exists():
                Follow.objects.filter(echouser=echouser, follow=profile).delete()
                data['status'] = 'unfollowed'

            else:
                new_follow = Follow(echouser=echouser, follow=profile)
                new_follow.save()
                data['status'] = 'followed'

            return JsonResponse(data)

    return render(request, '404.html')


def search_response(request):
    if request.GET['model'] == 'users':
        query = request.GET['query']
        if query:
            user_list = []
            names = []
            results = EchoUser.objects.filter(username__startswith=query).order_by('last_login').reverse()
            for result in results:
                if len(user_list) < 5:
                    user = dict()
                    user['username'] = result.username
                    user['avatar'] = result.avatar.url
                    user_list.append(user)
                    names.append(result.username)
                
                else: break
            
            if len(user_list) < 5:
                results = EchoUser.objects.filter(username__icontains=query).exclude(username__in=names)
                for result in results:
                    if len(user_list) < 5:
                        user = dict()
                        user['username'] = result.username
                        user['avatar'] = result.avatar.url
                        user_list.append(user)

                    else: break
            
            if len(user_list) > 0:
                data = { 'users': user_list }
            else:
                data = { 'users': "no results" }

            return JsonResponse(data)

    return render(request, '404.html')