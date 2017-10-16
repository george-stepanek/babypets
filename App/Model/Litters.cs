using System;
using System.Collections.Generic;

namespace App.Model
{
    public partial class Litters
    {
        public Litters()
        {
            Animals = new HashSet<Animals>();
        }

        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime? BornOn { get; set; }
        public int? WeeksToWean { get; set; }
        public decimal Price { get; set; }
        public decimal Deposit { get; set; }
        public string Animal { get; set; }
        public string Breed { get; set; }
        public string PictureUrl { get; set; }
        public string Description { get; set; }
        public DateTime Listed { get; set; }

        public Users User { get; set; }
        public ICollection<Animals> Animals { get; set; }
    }
}
