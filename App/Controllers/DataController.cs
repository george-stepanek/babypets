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
using System;

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

        [HttpGet("[action]")]
        public Model.Users LoggedIn()
        {
            var token = this.Request.Headers["Authorization"][0].Replace("Bearer ", "");
            Model.Users record = context.Users.FirstOrDefault(u => u.Token == token);
            record.Litters = context.Litters.Where(l => l.UserId == record.Id).ToList();
            foreach (Model.Litters l in record.Litters)
            {
                l.User = null;
                if (l.IsIndividual.Value)
                {
                    l.Animals = context.Animals.Where(a => a.LitterId == l.Id).ToList();
                    l.Animals.First().Litter = null;
                }
            }
            record.Token = null;
            return record;
        }

        [HttpPost("[action]")]
        public long SaveUser()
        {
            string json = new StreamReader(Request.Body).ReadToEnd();
            Model.Users user = JsonConvert.DeserializeObject<Model.Users>(json);

            var token = this.Request.Headers["Authorization"][0].Replace("Bearer ", "");
            Model.Users bearer = context.Users.FirstOrDefault(u => u.Token == token);
            if (bearer == null || bearer.Id != user.Id) return 0; // security check

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
        public Model.Users GetUser(long id)
        {
            var record = context.Users.Find(id);
            record.Litters = context.Litters.Where(l => l.UserId == id).ToList();
            foreach (Model.Litters l in record.Litters)
            {
                l.User = null;
                if (l.IsIndividual.Value)
                {
                    l.Animals = context.Animals.Where(a => a.LitterId == l.Id).ToList();
                    l.Animals.First().Litter = null;
                }
            }
            record.Token = null;

            var token = this.Request.Headers["Authorization"][0].Replace("Bearer ", "");
            Model.Users bearer = context.Users.FirstOrDefault(u => u.Token == token);
            if (bearer == null || bearer.Id != record.Id) record.BankAccount = null; // security check

            return record;
        }

        [HttpGet("[action]")]
        public IEnumerable<Model.Litters> Litters(long userid, int page, string type, string location)
        {
            try
            {
                const int pageSize = 20;
                List<Model.Litters> litters = context.Litters.Where(
                    l => (userid == 0 || l.UserId == userid) && (type == null || l.Animal == type) && (location == null || l.User.Location == location)
                ).OrderByDescending(
                    l => l.Listed.Ticks // Sort by date listed
                ).Skip(pageSize * page).Take(userid == 0 ? pageSize + 1 : int.MaxValue).ToList();

                // Clear the Litters field to remove circular references
                foreach (Model.Litters l in litters)
                {
                    l.User = context.Users.Find(l.UserId);
                    l.User.Litters = null;
                    l.User.Token = null;
                    l.User.BankAccount = null;
                    if (l.IsIndividual.Value)
                    {
                        l.Animals = context.Animals.Where(a => a.LitterId == l.Id).ToList();
                        l.Animals.First().Litter = null;
                    }
                }
                return litters;
            }
            catch (Exception e)
            {
                return null;
            }
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

            var token = this.Request.Headers["Authorization"][0].Replace("Bearer ", "");
            Model.Users bearer = context.Users.FirstOrDefault(u => u.Token == token);
            if (bearer == null || bearer.Id != record.UserId) return 0; // security check

            record.BornOn = litter.BornOn;
            record.WeeksToWean = litter.WeeksToWean;
            record.Price = litter.Price;
            record.Deposit = litter.Deposit;
            record.Animal = litter.Animal;
            record.Breed = litter.Breed;
            record.PictureUrl = litter.PictureUrl;
            record.Description = litter.Description;
            record.IsIndividual = litter.IsIndividual;
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
                var token = this.Request.Headers["Authorization"][0].Replace("Bearer ", "");
                Model.Users bearer = context.Users.FirstOrDefault(u => u.Token == token);
                if (bearer == null || bearer.Id != litter.UserId) return 0; // security check

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
                litter.User.Token = null;
                litter.User.BankAccount = null;
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

            var token = this.Request.Headers["Authorization"][0].Replace("Bearer ", "");
            Model.Users bearer = context.Users.FirstOrDefault(u => u.Token == token);
            if (bearer == null || bearer.Id != context.Litters.Find(animal.LitterId).UserId) return 0; // security check

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
                var token = this.Request.Headers["Authorization"][0].Replace("Bearer ", "");
                Model.Users bearer = context.Users.FirstOrDefault(u => u.Token == token);
                if (bearer == null || bearer.Id != context.Litters.Find(animal.LitterId).UserId) return 0; // security check

                DeleteImage(animal.PictureUrl);
                context.Animals.Remove(animal);
                context.SaveChanges();
            }
            return id;
        }

        [HttpPut("[action]")]
        public int HoldAnimal(int id, string path, string address)
        {
            var animal = context.Animals.Find(id);
            if (animal != null)
            {
                var litter = context.Litters.Find(animal.LitterId);
                if (litter != null)
                {
                    var user = context.Users.Find(litter.UserId);
                    if (user != null)
                    {
                        var email = new Model.Emails();
                        email.UserId = user.Id;
                        email.To = address;
                        email.From = user.Email;
                        email.Message = "Hello there!\n\n" + 
                            "Thank you for your interest in purchasing http://boop.co.nz/" + path + "/" + litter.Id + (litter.IsIndividual.Value ? "" : "/" + animal.Id) + "\n\n" +
                            "Please make a payment of $" + litter.Deposit.ToString("F2") + " " +
                                "into my bank account (" + user.BankAccount + ") within 24 hours to hold them for you.\n\n" +
                            "Please include the reference number (" + litter.Id + "/" + animal.Id + 
                                ") in your deposit details to ensure we match up your payment correctly.\n\n" +
                            "Thanks!\n\n" + user.Name;
                        string subject = "Deposit for " + (animal.IsFemale.Value ? "Female" : "Male") + " " + litter.Breed + " " + litter.Animal;
                        SendEmailMessage(email, subject);

                        animal.Hold = true;
                        context.SaveChanges();
                    }
                }
            }
            return id;
        }

        [HttpPut("[action]")]
        public int EmailReAnimal(int id, string path, string address)
        {
            var animal = context.Animals.Find(id);
            if (animal != null)
            {
                var litter = context.Litters.Find(animal.LitterId);
                if (litter != null)
                {
                    var user = context.Users.Find(litter.UserId);
                    if (user != null)
                    {
                        var email = new Model.Emails();
                        email.UserId = user.Id;
                        email.To = address;
                        email.From = user.Email;
                        email.Message = "Hello there!\n\n" +
                            "Thank you for your interest in http://boop.co.nz/" + path + "/" + litter.Id + (litter.IsIndividual.Value ? "" : "/" + animal.Id) + "\n\n" +
                            "We'll get in contact shortly to arrange a time for you to view them.\n\n" +
                            "Thanks!\n\n" + user.Name;
                        string subject = "Interested in " + (animal.IsFemale.Value ? "Female" : "Male") + " " + litter.Breed + " " + litter.Animal;
                        SendEmailMessage(email, subject);
                    }
                }
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
            return SendEmailMessage(email);
        }

        public int SendEmailMessage(Model.Emails email, string subject = null)
        {
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
                MailMessage msg = new MailMessage
                {
                    From = new MailAddress(email.From),
                    Subject = subject != null ? subject : "New message via boop.co.nz"
                };
                msg.To.Add(new MailAddress(email.To));
                msg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(email.Message, null, MediaTypeNames.Text.Plain));
                if (subject != null) // Need to cc the seller for deposit emails
                    msg.CC.Add(new MailAddress(email.From));

                SmtpClient client = new SmtpClient("smtp.sendgrid.net", System.Convert.ToInt32(587));
                client.Credentials = new NetworkCredential(username, password);
                client.Send(msg);
            }
            return record.Id;
        }
    }
}
