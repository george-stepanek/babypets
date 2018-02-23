using System;
using System.Collections.Generic;

namespace App.Model
{
    public partial class Emails
    {
        public int Id { get; set; }
        public long UserId { get; set; }
        public string To { get; set; }
        public string From { get; set; }
        public string Message { get; set; }

        public Users User { get; set; }
    }
}
