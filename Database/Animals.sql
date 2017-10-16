CREATE TABLE [dbo].[Animals]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [LitterId] INT NOT NULL, 
    [IsFemale] BIT NOT NULL DEFAULT 0, 
    [Hold] BIT NOT NULL DEFAULT 0, 
    [Sold] BIT NOT NULL DEFAULT 0, 
    [Description] VARCHAR(MAX) NULL, 
    [PictureUrl] VARCHAR(MAX) NULL, 
    [PriceOverride] MONEY NULL, 
    CONSTRAINT [FK_Animal_ToLitter] FOREIGN KEY ([LitterId]) REFERENCES [Litters]([Id])
)
