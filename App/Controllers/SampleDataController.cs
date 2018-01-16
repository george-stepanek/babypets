using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers
{
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<Model.Litters> WeatherForecasts(int startDateIndex)
        {
            using (var context = new Model.DatabaseContext())
            {
                return context.Litters.ToList();
            }
        }
    }
}
