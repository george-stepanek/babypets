using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Model
{
    [Table("litters", Schema = "public")]
    public partial class Litters
    {
        public Litters()
        {
            Animals = new HashSet<Animals>();
        }

        [Column("id")]
        public int Id { get; set; }
        [Column("userid")]
        public long UserId { get; set; }
        [Column("bornon")]
        public DateTime? BornOn { get; set; }
        [Column("weekstowean")]
        public int? WeeksToWean { get; set; }
        [Column("price")]
        public decimal Price { get; set; }
        [Column("deposit")]
        public decimal Deposit { get; set; }
        [Column("animal")]
        public string Animal { get; set; }
        [Column("breed")]
        public string Breed { get; set; }
        [Column("pictureurl")]
        public string PictureUrl { get; set; }
        [Column("description")]
        public string Description { get; set; }
        [Column("listed")]
        public DateTime Listed { get; set; }
        [Column("isindividual")]
        public bool? IsIndividual { get; set; }

        public Users User { get; set; }
        public ICollection<Animals> Animals { get; set; }
    }
}
