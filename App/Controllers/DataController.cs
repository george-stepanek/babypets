using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Newtonsoft.Json;
using CloudinaryDotNet;
using System.Net.Mail;
using System.Net.Mime;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace App.Controllers
{
    [Route("api/[controller]")]
    public class DataController : Controller
    {
        Model.DatabaseContext context;
        public DataController(Model.DatabaseContext dbcontext)
        {
            context = dbcontext;
        }

        [HttpPost("[action]")]
        public Model.Users Login(long id)
        {
            var record = context.Users.Find(id);
            if (record == null)
            {
                string json = new StreamReader(Request.Body).ReadToEnd();
                Model.Users user = JsonConvert.DeserializeObject<Model.Users>(json);

                Cloudinary cloudinary = new Cloudinary(new Account("boop-co-nz", "943269911688589", "ueHZx0uGD5mnqXYC6xNOO2J628w"));
                var result = cloudinary.Upload(new CloudinaryDotNet.Actions.ImageUploadParams() { File = new FileDescription(user.PictureUrl) });

                record = new Model.Users
                {
                    Id = id,
                    Name = user.Name,
                    Email = user.Email,
                    PictureUrl = result.SecureUri.ToString()
                };
                context.Users.Add(record);
                context.SaveChanges();
            }
            record.Litters = context.Litters.Where(l => l.UserId == id).ToList();
            foreach (Model.Litters l in record.Litters)
            {
                l.User = null;
            }
            return record;
        }

        [HttpPost("[action]")]
        public long SaveUser()
        {
            string json = new StreamReader(Request.Body).ReadToEnd();
            Model.Users user = JsonConvert.DeserializeObject<Model.Users>(json);

            var record = context.Users.Find(user.Id);
            if (user.PictureUrl != record.PictureUrl)
            {
                DeleteImage(record.PictureUrl);
            }
            record.Name = user.Name;
            record.Email = user.Email;
            record.Phone = user.Phone;
            record.BankAccount = user.BankAccount;
            record.Location = user.Location;
            record.Description = user.Description;
            record.PictureUrl = user.PictureUrl;
            record.Style = user.Style;
            context.SaveChanges();

            return record.Id;
        }

        [HttpGet("[action]")]
        public IEnumerable<Model.Litters> Litters(long userid, int page, string type, string location)
        {
            const int pageSize = 20;
            List<Model.Litters> litters = context.Litters.Where(
                l => (userid == 0 || l.UserId == userid) && (type == null || l.Animal == type) && (location == null || l.User.Location == location)
            ).OrderByDescending(
                l => l.BornOn.Value.AddDays(l.WeeksToWean.Value * 7).Ticks // Sort by date available
            ).Skip(pageSize * page).Take(userid == 0 ? pageSize + 1 : int.MaxValue).ToList();

            // Clear the Litters field to remove circular references
            foreach (Model.Litters l in litters)
            {
                l.User = context.Users.Find(l.UserId);
                l.User.Litters = null;
            }
            return litters;
        }

        [HttpPost("[action]")]
        public int SaveLitter()
        {
            string json = new StreamReader(Request.Body).ReadToEnd();
            Model.Litters litter = JsonConvert.DeserializeObject<Model.Litters>(json);

            var record = context.Litters.Find(litter.Id);
            if (record == null)
            {
                record = new Model.Litters();
                context.Litters.Add(record);
                record.UserId = litter.UserId;
                record.Listed = litter.Listed;
            }
            else
            {
                if (litter.PictureUrl != record.PictureUrl)
                {
                    DeleteImage(record.PictureUrl);
                }
            }

            record.BornOn = litter.BornOn;
            record.WeeksToWean = litter.WeeksToWean;
            record.Price = litter.Price;
            record.Deposit = litter.Deposit;
            record.Animal = litter.Animal;
            record.Breed = litter.Breed;
            record.PictureUrl = litter.PictureUrl;
            record.Description = litter.Description;
            context.SaveChanges();

            foreach (Model.Animals animal in litter.Animals)
            {
                animal.LitterId = record.Id;
                SaveAnimalToDb(animal);
            }

            return record.Id;
        }

        [HttpDelete("[action]")]
        public int DeleteLitter(int id)
        {
            var litter = context.Litters.Find(id);
            if (litter != null)
            {
                litter.Animals = context.Animals.Where(a => a.LitterId == id).ToList();
                foreach (Model.Animals animal in litter.Animals)
                {
                    DeleteImage(animal.PictureUrl);
                    context.Animals.Remove(animal);
                }
                DeleteImage(litter.PictureUrl);
                context.Litters.Remove(litter);
                context.SaveChanges();
            }
            return id;
        }

        [HttpGet("[action]")]
        public Model.Litters Litter(int id, long userid)
        {
            var litter = context.Litters.Find(id);
            if (litter == null)
            {
                // Use local time instead of server time to ensure we have the right day
                var timezone = System.TimeZoneInfo.CreateCustomTimeZone("NZST", new System.TimeSpan(12, 00, 00), "NZST", "NZST");
                var today = System.TimeZoneInfo.ConvertTimeToUtc(System.DateTime.Now);
                today = System.TimeZoneInfo.ConvertTimeFromUtc(today, timezone).Date;

                litter = new Model.Litters
                {
                    UserId = userid,
                    Animal = "cat",
                    WeeksToWean = 0,
                    BornOn = today,
                    Listed = today
                };
            }
            litter.User = context.Users.Find(litter.UserId);
            if (litter.User != null)
            {
                litter.User.Litters = null;
            }
            litter.Animals = context.Animals.Where(a => a.LitterId == id).ToList();
            foreach (Model.Animals a in litter.Animals) { a.Litter = null; }
            return litter;
        }

        [HttpPost("[action]")]
        public int SaveAnimal()
        {
            string json = new StreamReader(Request.Body).ReadToEnd();
            Model.Animals animal = JsonConvert.DeserializeObject<Model.Animals>(json);
            return SaveAnimalToDb(animal);
        }

        private int SaveAnimalToDb(Model.Animals animal)
        {
            var record = context.Animals.Find(animal.Id);
            if (record == null)
            {
                record = new Model.Animals();
                context.Animals.Add(record);
                record.LitterId = animal.LitterId;
            }
            else
            {
                if (animal.PictureUrl != record.PictureUrl)
                {
                    DeleteImage(record.PictureUrl);
                }
            }

            record.PriceOverride = animal.PriceOverride;
            record.IsFemale = animal.IsFemale;
            record.Hold = animal.Hold;
            record.Sold = animal.Sold;
            record.PictureUrl = animal.PictureUrl;
            record.Description = animal.Description;

            context.SaveChanges();
            return record.Id;
        }

        [HttpDelete("[action]")]
        public int DeleteAnimal(int id)
        {
            var animal = context.Animals.Find(id);
            if (animal != null)
            {
                DeleteImage(animal.PictureUrl);
                context.Animals.Remove(animal);
                context.SaveChanges();
            }
            return id;
        }

        [HttpDelete("[action]")]
        public void DeleteImage(string url)
        {
            if (url != null && url.Length > 0)
            {
                Cloudinary cloudinary = new Cloudinary(new Account("boop-co-nz", "943269911688589", "ueHZx0uGD5mnqXYC6xNOO2J628w"));
                string imageId = url.Substring(url.LastIndexOf('/') + 1).Replace(".jpg", "");
                cloudinary.Destroy(new CloudinaryDotNet.Actions.DeletionParams(imageId));
            }
        }

        [HttpPost("[action]")]
        public int SendEmail()
        {
            string json = new StreamReader(Request.Body).ReadToEnd();
            Model.Emails email = JsonConvert.DeserializeObject<Model.Emails>(json);

            var record = new Model.Emails();
            if (email.UserId > 0)
            {
                context.Emails.Add(record);
                record.UserId = email.UserId;
                record.To = email.To;
                record.From = email.From;
                record.Message = email.Message;
                context.SaveChanges();
            }
#if DEBUG
            var env = "appsettings.Development.json";
#else
            var env = "appsettings.json";
#endif
            var config = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile(env).Build();
            var username = config.GetValue<string>("Smtp:Username");
            var password = config.GetValue<string>("Smtp:Password");

            if (username != null && password != null)
            {
                MailMessage msg = new MailMessage { From = new MailAddress(email.From), Subject = "New message via boop.co.nz" };
                msg.To.Add(new MailAddress(email.To));
                msg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(email.Message, null, MediaTypeNames.Text.Plain));

                SmtpClient client = new SmtpClient("smtp.sendgrid.net", System.Convert.ToInt32(587));
                client.Credentials = new NetworkCredential(username, password);
                client.Send(msg);
            }
            return record.Id;
        }
    }
}
