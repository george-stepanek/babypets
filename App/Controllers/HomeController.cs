using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using CloudinaryDotNet;

namespace App.Controllers
{
    public class HomeController : Controller
    {
        Model.DatabaseContext context;
        public HomeController(Model.DatabaseContext dbcontext)
        {
            context = dbcontext;
        }

        public IActionResult Index()
        {
            if (this.User.Identity.IsAuthenticated)
            {
                var task = this.HttpContext.GetTokenAsync("access_token");
                task.Wait();
                ViewData["AccessToken"] = task.Result;

                var id = this.User.Claims.FirstOrDefault(c => c.Type.IndexOf("nameidentifier") > 0).Value;
                var record = context.Users.Find(long.Parse(id));
                if(record == null)
                {
                    string pictureUrl = "https://graph.facebook.com/" + id + "/picture?width=9999";
                    Cloudinary cloudinary = new Cloudinary(new Account("boop-co-nz", "943269911688589", "ueHZx0uGD5mnqXYC6xNOO2J628w"));
                    var result = cloudinary.Upload(new CloudinaryDotNet.Actions.ImageUploadParams() { File = new FileDescription(pictureUrl) });

                    record = new Model.Users
                    {
                        Id = long.Parse(id),
                        Name = this.User.Claims.FirstOrDefault(c => c.Type.IndexOf("claims/name") > 0 && c.Type.IndexOf("identifier") <= 0).Value,                        
                        Email = this.User.Claims.FirstOrDefault(c => c.Type.IndexOf("emailaddress") > 0).Value,
                        PictureUrl = result.SecureUri.ToString()
                    };
                    context.Users.Add(record);
                }
                record.Token = task.Result;
                context.SaveChanges();
            }

            if (this.Request.Path.Value.IndexOf("litter/") >= 0)
            {
                int id = int.Parse(this.Request.Path.Value.Substring(this.Request.Path.Value.LastIndexOf("/") + 1));
                var litter = context.Litters.Find(id);
                litter.User = context.Users.Find(litter.UserId);

                ViewData["PageUrl"] = "http://boop.co.nz/litter/" + id;
                ViewData["PictureUrl"] = litter.PictureUrl;
                ViewData["PageTitle"] = litter.Breed + " " + litter.Animal.ToLower() +
                    (litter.Animal != "Fish" && !litter.IsIndividual.Value ? "s" : "") + " from " + litter.User.Name;
            }

            return View();
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}
