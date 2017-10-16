using System;
using System.Collections.Generic;

namespace App.Model
{
    public partial class Animals
    {
        public int Id { get; set; }
        public int LitterId { get; set; }
        public bool? IsFemale { get; set; }
        public bool? Hold { get; set; }
        public bool? Sold { get; set; }
        public string Description { get; set; }
        public string PictureUrl { get; set; }
        public decimal? PriceOverride { get; set; }

        public Litters Litter { get; set; }
    }
}
