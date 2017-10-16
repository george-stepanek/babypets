CREATE TABLE [dbo].[Litters]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [UserId] INT NOT NULL, 
    [BornOn] DATE NULL, 
    [WeeksToWean] INT NULL, 
    [Price] MONEY NOT NULL DEFAULT 0, 
    [Deposit] MONEY NOT NULL DEFAULT 0, 
    [Animal] VARCHAR(MAX) NOT NULL DEFAULT 'cat', 
    [Breed] VARCHAR(MAX) NULL, 
    [PictureUrl] VARCHAR(MAX) NULL, 
    [Description] VARCHAR(MAX) NULL, 
    [Listed] DATE NOT NULL DEFAULT GETDATE(), 
    CONSTRAINT [FK_Litter_ToUser] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id])
)
