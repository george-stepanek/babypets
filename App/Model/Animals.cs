using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Model
{
    [Table("animals", Schema = "public")]
    public partial class Animals
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("litterid")]
        public int LitterId { get; set; }
        [Column("isfemale")]
        public bool? IsFemale { get; set; }
        [Column("hold")]
        public bool? Hold { get; set; }
        [Column("sold")]
        public bool? Sold { get; set; }
        [Column("description")]
        public string Description { get; set; }
        [Column("pictureurl")]
        public string PictureUrl { get; set; }
        [Column("priceoverride")]
        public decimal? PriceOverride { get; set; }

        public Litters Litter { get; set; }
    }
}
