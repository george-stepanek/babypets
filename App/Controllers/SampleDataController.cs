using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("[action]")]
        public Model.Litters Litter(int id)
        {
            using (var context = new Model.DatabaseContext())
            {
                var litter = context.Litters.Find(id);
                litter.User = context.Users.Find(litter.UserId);
                litter.User.Litters = null;
                litter.Animals = context.Animals.Where(a => a.LitterId == id).ToList();
                foreach (Model.Animals a in litter.Animals) { a.Litter = null; }
                return litter;
            }
        }
    }
}
