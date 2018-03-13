CREATE TABLE [dbo].[Users]
(
	[Id] BIGINT NOT NULL, 
    [Name] VARCHAR(MAX) NULL, 
    [Email] VARCHAR(MAX) NULL, 
    [Phone] VARCHAR(MAX) NULL, 
    [Description] VARCHAR(MAX) NULL, 
    [PictureUrl] VARCHAR(MAX) NULL, 
    [Location] VARCHAR(MAX) NULL, 
    [BankAccount] VARCHAR(MAX) NULL, 
    [Style] VARCHAR(MAX) NULL, 
    [Token] VARCHAR(MAX) NULL, 
    CONSTRAINT [PK_User] PRIMARY KEY ([Id]) 
)
