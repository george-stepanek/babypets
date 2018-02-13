CREATE TABLE [dbo].[Users]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Name] VARCHAR(MAX) NULL, 
    [Email] VARCHAR(MAX) NULL, 
    [Phone] VARCHAR(MAX) NULL, 
    [Description] VARCHAR(MAX) NULL, 
    [PictureUrl] VARCHAR(MAX) NULL, 
    [Location] VARCHAR(MAX) NULL
)
