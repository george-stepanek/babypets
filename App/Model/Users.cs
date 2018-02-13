using System;
using System.Collections.Generic;

namespace App.Model
{
    public partial class Users
    {
        public Users()
        {
            Litters = new HashSet<Litters>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Description { get; set; }
        public string PictureUrl { get; set; }
        public string Location { get; set; }

        public ICollection<Litters> Litters { get; set; }
    }
}
