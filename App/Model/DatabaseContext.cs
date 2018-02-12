using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace App.Model
{
    public partial class DatabaseContext : IdentityDbContext<IdentityUser>
    {
        public virtual DbSet<Animals> Animals { get; set; }
        public virtual DbSet<Litters> Litters { get; set; }
        public virtual DbSet<MyUsers> MyUsers { get; set; }

        public DatabaseContext(DbContextOptions<DatabaseContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Animals>(entity =>
            {
                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.Hold).HasDefaultValueSql("((0))");

                entity.Property(e => e.IsFemale).HasDefaultValueSql("((0))");

                entity.Property(e => e.PictureUrl).IsUnicode(false);

                entity.Property(e => e.PriceOverride).HasColumnType("money");

                entity.Property(e => e.Sold).HasDefaultValueSql("((0))");

                entity.HasOne(d => d.Litter)
                    .WithMany(p => p.Animals)
                    .HasForeignKey(d => d.LitterId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Animal_ToLitter");
            });

            modelBuilder.Entity<Litters>(entity =>
            {
                entity.Property(e => e.Animal)
                    .IsRequired()
                    .IsUnicode(false)
                    .HasDefaultValueSql("('cat')");

                entity.Property(e => e.BornOn).HasColumnType("date");

                entity.Property(e => e.Breed).IsUnicode(false);

                entity.Property(e => e.Deposit)
                    .HasColumnType("money")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.Listed)
                    .HasColumnType("date")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.PictureUrl).IsUnicode(false);

                entity.Property(e => e.Price)
                    .HasColumnType("money")
                    .HasDefaultValueSql("((0))");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Litters)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Litter_ToUser");
            });

            modelBuilder.Entity<MyUsers>(entity =>
            {
                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.Email).IsUnicode(false);

                entity.Property(e => e.Location).IsUnicode(false);

                entity.Property(e => e.Name).IsUnicode(false);

                entity.Property(e => e.Phone).IsUnicode(false);

                entity.Property(e => e.PictureUrl).IsUnicode(false);
            });
        }
    }
}
