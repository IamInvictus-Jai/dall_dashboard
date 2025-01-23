from django.shortcuts import render, redirect
from django.utils.timezone import now
from utils.databaseHandler import MongoDB
from django.http import JsonResponse
from itertools import chain

# Create your views here.
def index(request):
    return redirect("user-dashboard")

def render_dashboard(request):
    return render(request, "user_dashboard.html",
                  context= {
                        'timestamp': int(now().timestamp()),
                    })

def send_images(request):
    if request.method == "GET": 
        database_obj = MongoDB()
        links_mapping: dict = database_obj.get_links_and_preferred()
        response = {
            "images": links_mapping
        }

        return JsonResponse(response, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# def send_images(request):

#     if request.method == "GET": 
#         database_obj = MongoDB()
#         links: dict = database_obj.get_all_links()

#         for key, values in links.items():
#             values = list(chain(*values))
#             links[key] = values
        
#         response = {
#             "images": links
#         }

#         return JsonResponse(response, status=200)
#     return JsonResponse({"error": "Method not allowed"}, status=405)
    
    