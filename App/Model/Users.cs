using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Model
{
    [Table("users", Schema = "public")]
    public partial class Users
    {
        public Users()
        {
            Litters = new HashSet<Litters>();
        }

        [Column("id")]
        public long Id { get; set; }
        [Column("name")]
        public string Name { get; set; }
        [Column("email")]
        public string Email { get; set; }
        [Column("phone")]
        public string Phone { get; set; }
        [Column("bankaccount")]
        public string BankAccount { get; set; }
        [Column("description")]
        public string Description { get; set; }
        [Column("pictureurl")]
        public string PictureUrl { get; set; }
        [Column("location")]
        public string Location { get; set; }
        [Column("style")]
        public string Style { get; set; }
        [Column("token")]
        public string Token { get; set; }

        public ICollection<Litters> Litters { get; set; }
        public ICollection<Emails> Emails { get; set; }
    }
}
