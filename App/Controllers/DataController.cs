using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Newtonsoft.Json;

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
                record = new Model.Users
                {
                    Id = id,
                    Name = user.Name,
                    Email = user.Email
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
            record.Name = user.Name;
            record.Email = user.Email;
            record.Phone = user.Phone;
            record.Location = user.Location;
            record.Description = user.Description;
            record.PictureUrl = user.PictureUrl;
            context.SaveChanges();

            return record.Id;
        }

        [HttpGet("[action]")]
        public IEnumerable<Model.Litters> Litters(long userid, string type, string location)
        {
            List<Model.Litters> litters = context.Litters.Where(
                l => (userid == 0 || l.UserId == userid) && (type == null || l.Animal == type) && (location == null || l.User.Location == location)
            ).OrderByDescending(
                l => l.BornOn.Value.AddDays(l.WeeksToWean.Value * 7).Ticks // Sort by date available
            ).Take(100).ToList();

            // Clear the Litters field to remove circular references
            foreach (Model.Litters l in litters) {
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

            record.BornOn = litter.BornOn;
            record.WeeksToWean = litter.WeeksToWean;
            record.Price = litter.Price;
            record.Deposit = litter.Deposit;
            record.Animal = litter.Animal;
            record.Breed = litter.Breed;
            record.PictureUrl = litter.PictureUrl;
            record.Description = litter.Description;
            context.SaveChanges();

            foreach(Model.Animals animal in litter.Animals)
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
                    context.Animals.Remove(animal);
                }
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
                litter.User.Litters = null;
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
                context.Animals.Remove(animal);
                context.SaveChanges();
            }
            return id;
        }
    }
}