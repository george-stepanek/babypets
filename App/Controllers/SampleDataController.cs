using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Newtonsoft.Json;

namespace App.Controllers
{
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<Model.Litters> Litters(int offset)
        {
            using (var context = new Model.DatabaseContext())
            {
                var litters = context.Litters.ToList();
                foreach (Model.Litters l in litters) {
                    l.User = context.Users.Find(l.UserId);
                    l.User.Litters = null;
                }
                return litters;
            }
        }

        [HttpPost("[action]")]
        public int SaveLitter()
        {
            string json = new StreamReader(Request.Body).ReadToEnd();
            Model.Litters litter = JsonConvert.DeserializeObject<Model.Litters>(json);

            using (var context = new Model.DatabaseContext())
            {
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
                return record.Id;
            }
        }

        [HttpGet("[action]")]
        public Model.Litters Litter(int id)
        {
            using (var context = new Model.DatabaseContext())
            {
                var litter = context.Litters.Find(id);
                if (litter == null)
                {
                    litter = new Model.Litters
                    {
                        UserId = 3,
                        Animal = "cat",
                        WeeksToWean = 0,
                        BornOn = System.DateTime.Today,
                        Listed = System.DateTime.Today
                    };
                }
                litter.User = context.Users.Find(litter.UserId);
                litter.User.Litters = null;
                litter.Animals = context.Animals.Where(a => a.LitterId == id).ToList();
                foreach (Model.Animals a in litter.Animals) { a.Litter = null; }
                return litter;
            }
        }
    }
}
