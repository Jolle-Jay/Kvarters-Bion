namespace WebApp;

public static class DbQuery
{
    // Setup the database connection from config
    private static string connectionString;

    // JSON columns for _CONTAINS_ validation
    public static Arr JsonColumns = Arr(new[] { "categories" });

    public static bool IsJsonColumn(string column) => JsonColumns.Includes(column);

    static DbQuery()
    {
        var configPath = Path.Combine(
            AppContext.BaseDirectory, "..", "..", "..", "db-config.json"
        );
        var configJson = File.ReadAllText(configPath);
        var config = JSON.Parse(configJson);

        connectionString =
            $"Server={config.host};Port={config.port};Database={config.database};" +
            $"User={config.username};Password={config.password};";

        var db = new MySqlConnection(connectionString);
        db.Open();

        // Create tables if they don't exist
        if (config.createTablesIfNotExist == true)
        {
            CreateTablesIfNotExist(db);
        }

        // Seed data if tables are empty
        if (config.seedDataIfEmpty == true)
        {
            SeedDataIfEmpty(db);
        }

        db.Close();
    }

    private static void CreateTablesIfNotExist(MySqlConnection db)
    {
        var createTablesSql = @"
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(255) PRIMARY KEY NOT NULL,
                created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                data JSON
            );

            CREATE TABLE IF NOT EXISTS acl (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                userRoles VARCHAR(255) NOT NULL,
                method VARCHAR(50) NOT NULL DEFAULT 'GET',
                allow ENUM('allow', 'disallow') NOT NULL DEFAULT 'allow',
                route VARCHAR(255) NOT NULL,
                `match` ENUM('true', 'false') NOT NULL DEFAULT 'true',
                comment VARCHAR(500) NOT NULL DEFAULT '',
                UNIQUE KEY unique_acl (userRoles, method, route)
            );
            
            CREATE TABLE IF NOT EXISTS movies (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                movies_raw JSON NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS lounges (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            name VARCHAR(20) NOT NULL
            );
            

            CREATE TABLE IF NOT EXISTS viewings(
                id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            movie INTEGER NOT NULL,
	            lounge INTEGER NOT NULL,
	            start_time DATETIME NOT NULL
            );

                -- alter so that the movie and lounge is foreign key to other tables
                ALTER TABLE viewings
                ADD FOREIGN KEY(lounge) REFERENCES lounges(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(movie) REFERENCES movies(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;

            CREATE TABLE IF NOT EXISTS seats (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            lounge INTEGER NOT NULL,
	            seatRow CHAR(1) NOT NULL,
	            number INTEGER NOT NULL
            );

                -- alter seats for the foreign keys
                ALTER TABLE seats
                ADD FOREIGN KEY(lounge) REFERENCES lounges(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;


            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255),
                created DATETIME DEFAULT (CURDATE()) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                password VARCHAR(255) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS bookings (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            BookingReference VARCHAR(255) NOT NULL UNIQUE,
	            user INTEGER,
	            email VARCHAR(255) NOT NULL,
	            viewing INTEGER NOT NULL,
	            status VARCHAR(255) NOT NULL
            );

                -- alter bookings for the foreign keys
                ALTER TABLE bookings
                ADD FOREIGN KEY(user) REFERENCES users(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(viewing) REFERENCES viewings(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;
            

            CREATE TABLE IF NOT EXISTS ticketTypes (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            name VARCHAR(50) NOT NULL,
	            price INTEGER NOT NULL
            );
            

            CREATE TABLE IF NOT EXISTS bookingSeats (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            booking INTEGER NOT NULL,
	            seat INTEGER NOT NULL,
	            ticketType INTEGER NOT NULL
            );
                ALTER TABLE bookingSeats
                ADD FOREIGN KEY(booking) REFERENCES bookings(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(seat) REFERENCES seats(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(ticketType) REFERENCES ticketTypes(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;
        ";

        // Execute each statement separately
        foreach (var sql in createTablesSql.Split(';'))
        {
            var trimmed = sql.Trim();
            if (!string.IsNullOrEmpty(trimmed))
            {
                var command = db.CreateCommand();
                command.CommandText = trimmed;
                command.ExecuteNonQuery();
            }
        }
    }

    private static void SeedDataIfEmpty(MySqlConnection db)
    {
        // Check if tables are empty and seed if needed
        var command = db.CreateCommand();

        // Seed ACL rules
        command.CommandText = "SELECT COUNT(*) FROM acl";
        if (Convert.ToInt32(command.ExecuteScalar()) == 0)
        {
            var aclData = @"
                INSERT INTO acl (userRoles, method, allow, route, `match`, comment) VALUES
                ('visitor, user', 'GET', 'disallow', '/secret.html', 'true', 'No access to /secret.html for visitors and normal users'),
                ('visitor,user, admin', 'GET', 'allow', '/api', 'false', 'Allow access to all routes not starting with /api'),
                ('visitor', 'POST', 'allow', '/api/users', 'true', 'Allow registration as new user for visitors'),
                ('visitor, user,admin', '*', 'allow', '/api/login', 'true', 'Allow access to all login routes'),
                ('visitor,user,admin', 'POST', 'allow', '/api/chat', 'true', 'Allow all user roles to access AI chat'),
                ('admin', '*', 'allow', '/api/users', 'true', 'Allow admins to see and edit users'),
                ('admin', '*', 'allow', '/api/sessions', 'true', 'Allow admins to see and edit sessions'),
                ('admin', '*', 'allow', '/api/acl', 'true', 'Allow admins to see and edit acl rules'),
                ('visitor,user,admin', 'GET', 'allow', '/api/movies', 'true', 'Allow all user roles to read movies');
            ";
            command.CommandText = aclData;
            command.ExecuteNonQuery();
        }

        // Seed users
        command.CommandText = "SELECT COUNT(*) FROM users";
        if (Convert.ToInt32(command.ExecuteScalar()) == 0)
        {
            var usersData = @"
                INSERT INTO users (created, email, firstName, lastName, role, password) VALUES
                ('2024-04-02', 'thomas@nodehill.com', 'Thomas', 'Frank', 'admin', '$2a$13$IahRVtN2pxc1Ne1NzJUPpOQO5JCtDZvXpSF.IF8uW85S6VoZKCwZq'),
                ('2024-04-02', 'olle@nodehill.com', 'Olle', 'Olofsson', 'user', '$2a$13$O2Gs3FME3oA1DAzwE0FkOuMAOOAgRyuvNQq937.cl7D.xq0IjgzN.'),
                ('2024-04-02', 'maria@nodehill.com', 'Maria', 'Mårtensson', 'user', '$2a$13$p4sqCN3V3C1wQXspq4eN0eYwK51ypw7NPL6b6O4lMAOyATJtKqjHS');
            ";
            command.CommandText = usersData;
            command.ExecuteNonQuery();
        }

        // Seed movies
        command.CommandText = "SELECT COUNT(*) FROM movies";
        if (Convert.ToInt32(command.ExecuteScalar()) == 0)
        {/*
            var moviesData = new List<string>
            {
                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Joker',
                      'Year': '2019',
                      'Rated': 'R',
                      'Released': '04 Oct 2019',
                      'Runtime': '122 min',
                      'Genre': 'Crime, Drama, Thriller',
                      'Director': 'Todd Phillips',
                      'Writer': 'Todd Phillips, Scott Silver, Bob Kane',
                      'Actors': 'Joaquin Phoenix, Robert De Niro, Zazie Beetz',
                      'Plot': 'Arthur Fleck, a party clown and a failed stand-up comedian, leads an impoverished life with his ailing mother. However, when society shuns him and brands him as a freak, he decides to embrace the life of chaos in Gotham City.',
                      'Language': 'English, German',
                      'Country': 'United States, Canada, Australia',
                      'Awards': 'Won 2 Oscars. 120 wins & 246 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BNzY3OWQ5NDktNWQ2OC00ZjdlLThkMmItMDhhNDk3NTFiZGU4XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '8.3/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '68%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '59/100'
                        }
                      ],
                      'Metascore': '59',
                      'imdbRating': '8.3',
                      'imdbVotes': '1,663,329',
                      'imdbID': 'tt7286456',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$335,477,657',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'New Kids Turbo',
                      'Year': '2010',
                      'Rated': 'N/A',
                      'Released': '09 Dec 2010',
                      'Runtime': '84 min',
                      'Genre': 'Action, Comedy',
                      'Director': 'Steffen Haars, Flip Van der Kuil',
                      'Writer': 'Steffen Haars, Flip Van der Kuil',
                      'Actors': 'Huub Smit, Tim Haars, Wesley van Gaalen',
                      'Plot': 'Five friends from Maaskantje are getting fired because of the economic crisis. They decide that they won´t pay for anything anymore.',
                      'Language': 'Dutch',
                      'Country': 'Netherlands, United States',
                      'Awards': '6 wins total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BMjA3OTQxNDMwMV5BMl5BanBnXkFtZTcwNTQ2NjcyNA@@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '6.4/10'
                        }
                      ],
                      'Metascore': 'N/A',
                      'imdbRating': '6.4',
                      'imdbVotes': '18,626',
                      'imdbID': 'tt1648112',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': 'N/A',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Kopps',
                      'Year': '2003',
                      'Rated': 'N/A',
                      'Released': '07 Feb 2003',
                      'Runtime': '90 min',
                      'Genre': 'Action, Comedy',
                      'Director': 'Josef Fares',
                      'Writer': 'Josef Fares, Mikael Håfström, Vasa',
                      'Actors': 'Fares Fares, Torkel Petersson, Göran Ragnerstam',
                      'Plot': 'When a small-town police station is threatened with shutting down because of too little crime, the police realize that something must be done.',
                      'Language': 'Swedish, English',
                      'Country': 'Sweden, Denmark',
                      'Awards': '5 wins & 1 nomination total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BYmZhYmU4NWUtNWU2Yy00OWQ5LWFlNzQtODQ3NzgxNGViYTY4XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '6.7/10'
                        }
                      ],
                      'Metascore': 'N/A',
                      'imdbRating': '6.7',
                      'imdbVotes': '23,867',
                      'imdbID': 'tt0339230',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': 'N/A',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Ready Player One',
                      'Year': '2018',
                      'Rated': 'PG-13',
                      'Released': '29 Mar 2018',
                      'Runtime': '140 min',
                      'Genre': 'Action, Adventure, Sci-Fi',
                      'Director': 'Steven Spielberg',
                      'Writer': 'Zak Penn, Ernest Cline',
                      'Actors': 'Tye Sheridan, Olivia Cooke, Ben Mendelsohn',
                      'Plot': 'When the creator of a virtual reality called the OASIS dies, he makes a posthumous challenge to all OASIS users to find his Easter Egg, which will give the finder his fortune and control of his world.',
                      'Language': 'English, Japanese',
                      'Country': 'United States, India, Singapore, Canada, United Kingdom, Japan, Australia',
                      'Awards': 'Nominated for 1 Oscar. 11 wins & 58 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BNzVkMTgzODQtMWIwZC00NzE4LTgzZjYtMzAwM2I5OGZhNjE4XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.4/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '71%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '64/100'
                        }
                      ],
                      'Metascore': '64',
                      'imdbRating': '7.4',
                      'imdbVotes': '536,233',
                      'imdbID': 'tt1677720',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$137,715,350',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'The Notebook',
                      'Year': '2004',
                      'Rated': 'PG-13',
                      'Released': '25 Jun 2004',
                      'Runtime': '123 min',
                      'Genre': 'Drama, Romance',
                      'Director': 'Nick Cassavetes',
                      'Writer': 'Jeremy Leven, Jan Sardi, Nicholas Sparks',
                      'Actors': 'Gena Rowlands, James Garner, Rachel McAdams',
                      'Plot': 'An elderly man reads to a woman with dementia the story of two young lovers whose romance is threatened by the difference in their respective social classes.',
                      'Language': 'English',
                      'Country': 'United States',
                      'Awards': '12 wins & 10 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BZjE0ZjgzMzYtMTAxYi00NGMzLThmZDktNzFlMzA2MWRmYWQ0XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.8/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '54%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '53/100'
                        }
                      ],
                      'Metascore': '53',
                      'imdbRating': '7.8',
                      'imdbVotes': '675,051',
                      'imdbID': 'tt0332280',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$81,417,274',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Hamilton',
                      'Year': '2020',
                      'Rated': 'PG-13',
                      'Released': '03 Jul 2020',
                      'Runtime': '160 min',
                      'Genre': 'Biography, Drama, History, Musical',
                      'Director': 'Thomas Kail',
                      'Writer': 'Lin-Manuel Miranda, Ron Chernow',
                      'Actors': 'Lin-Manuel Miranda, Phillipa Soo, Leslie Odom Jr.',
                      'Plot': 'The real life of one of America´s foremost founding fathers and first Secretary of the Treasury, Alexander Hamilton. Captured live on Broadway from the Richard Rodgers Theater with the original Broadway cast.',
                      'Language': 'English, French',
                      'Country': 'United States',
                      'Awards': 'Won 2 Primetime Emmys. 19 wins & 43 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BYTc3MWIyMzAtMTZmNC00YmNjLWIyZTgtMmU4NjZkYzZkOThkXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '8.3/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '98%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '88/100'
                        }
                      ],
                      'Metascore': '88',
                      'imdbRating': '8.3',
                      'imdbVotes': '136,884',
                      'imdbID': 'tt8503618',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$16,946,377',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Wicked',
                      'Year': '2024',
                      'Rated': 'PG',
                      'Released': '22 Nov 2024',
                      'Runtime': '160 min',
                      'Genre': 'Fantasy, Musical, Romance',
                      'Director': 'Jon M. Chu',
                      'Writer': 'Winnie Holzman, Dana Fox, Gregory Maguire',
                      'Actors': 'Cynthia Erivo, Ariana Grande, Jeff Goldblum',
                      'Plot': 'Elphaba, a young woman ridiculed for her green skin, and Galinda, a popular girl, become friends at Shiz University in the Land of Oz. After an encounter with the Wonderful Wizard of Oz, their friendship reaches a crossroads.',
                      'Language': 'English',
                      'Country': 'United Kingdom, United States, Canada',
                      'Awards': 'Won 2 Oscars. 125 wins & 324 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BOWMwYjYzYmMtMWQ2Ni00NWUwLTg2MzAtYzkzMDBiZDIwOTMwXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.4/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '88%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '73/100'
                        }
                      ],
                      'Metascore': '73',
                      'imdbRating': '7.4',
                      'imdbVotes': '191,746',
                      'imdbID': 'tt1262426',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$474,560,015',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Phantom of the Opera',
                      'Year': '1943',
                      'Rated': 'Approved',
                      'Released': '27 Aug 1943',
                      'Runtime': '92 min',
                      'Genre': 'Drama, Horror, Musical',
                      'Director': 'Arthur Lubin',
                      'Writer': 'Eric Taylor, Samuel Hoffenstein, Hans Jacoby',
                      'Actors': 'Nelson Eddy, Susanna Foster, Claude Rains',
                      'Plot': 'An acid-scarred composer rises from the Paris sewers to boost his favorite opera understudy´s career.',
                      'Language': 'English',
                      'Country': 'United States',
                      'Awards': 'Won 2 Oscars. 3 wins & 5 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BZDVhZDM4NmItZWQ4OS00MDYxLWI5ZGItZDhmNTUyZGQwYWVmXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '6.4/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '81%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '63/100'
                        }
                      ],
                      'Metascore': '63',
                      'imdbRating': '6.4',
                      'imdbVotes': '9,179',
                      'imdbID': 'tt0036261',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': 'N/A',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Avatar: Fire and Ash',
                      'Year': '2025',
                      'Rated': 'PG-13',
                      'Released': '19 Dec 2025',
                      'Runtime': '197 min',
                      'Genre': 'Animation, Action, Adventure',
                      'Director': 'James Cameron',
                      'Writer': 'James Cameron, Rick Jaffa, Amanda Silver',
                      'Actors': 'Sam Worthington, Zoe Saldaña, Sigourney Weaver',
                      'Plot': 'Jake and Neytiri´s family grapples with grief, encountering a new, aggressive Na´vi tribe, the Ash People, who are led by the fiery Varang, as the conflict on Pandora escalates and a new moral focus emerges.',
                      'Language': 'English',
                      'Country': 'United States, Canada',
                      'Awards': 'Nominated for 2 Oscars. 17 wins & 57 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BZDYxY2I1OGMtN2Y4MS00ZmU1LTgyNDAtODA0MzAyYjI0N2Y2XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.4/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '66%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '61/100'
                        }
                      ],
                      'Metascore': '61',
                      'imdbRating': '7.4',
                      'imdbVotes': '123,629',
                      'imdbID': 'tt1757678',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$386,126,673',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                    @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Grown Ups',
                      'Year': '2010',
                      'Rated': 'PG-13',
                      'Released': '25 Jun 2010',
                      'Runtime': '102 min',
                      'Genre': 'Comedy',
                      'Director': 'Dennis Dugan',
                      'Writer': 'Adam Sandler, Fred Wolf',
                      'Actors': 'Adam Sandler, Salma Hayek, Kevin James',
                      'Plot': 'After their high school basketball coach passes away, five good friends and former teammates reunite for a Fourth of July holiday weekend.',
                      'Language': 'English, Spanish',
                      'Country': 'United States',
                      'Awards': '3 wins & 4 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BMjA0ODYwNzU5Nl5BMl5BanBnXkFtZTcwNTI1MTgxMw@@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '6.0/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '10%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '30/100'
                        }
                      ],
                      'Metascore': '30',
                      'imdbRating': '6.0',
                      'imdbVotes': '307,736',
                      'imdbID': 'tt1375670',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$162,001,186',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'The Exorcist',
                      'Year': '1973',
                      'Rated': 'R',
                      'Released': '26 Dec 1973',
                      'Runtime': '122 min',
                      'Genre': 'Horror',
                      'Director': 'William Friedkin',
                      'Writer': 'William Peter Blatty',
                      'Actors': 'Ellen Burstyn, Max von Sydow, Linda Blair',
                      'Plot': 'When a mysterious entity possesses a young girl, her mother seeks the help of two Catholic priests to save her life.',
                      'Language': 'English, Latin, Greek, French, German, Arabic, Kurdish',
                      'Country': 'United States',
                      'Awards': 'Won 2 Oscars. 18 wins & 21 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BZjg3YjE4ZjAtYTdmYS00ZTBkLWE1ZjgtNzAzODUwNzRiYjlmXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '8.1/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '78%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '83/100'
                        }
                      ],
                      'Metascore': '83',
                      'imdbRating': '8.1',
                      'imdbVotes': '493,216',
                      'imdbID': 'tt0070047',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$233,005,644',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Alien',
                      'Year': '1979',
                      'Rated': 'R',
                      'Released': '22 Jun 1979',
                      'Runtime': '117 min',
                      'Genre': 'Horror, Sci-Fi',
                      'Director': 'Ridley Scott',
                      'Writer': 'Dan O´Bannon, Ronald Shusett',
                      'Actors': 'Sigourney Weaver, Tom Skerritt, John Hurt',
                      'Plot': 'After investigating a mysterious transmission of unknown origin, the crew of a commercial spacecraft encounters a deadly lifeform.',
                      'Language': 'English',
                      'Country': 'United Kingdom, United States',
                      'Awards': 'Won 1 Oscar. 19 wins & 22 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BN2NhMDk2MmEtZDQzOC00MmY5LThhYzAtMDdjZGFjOGZjMjdjXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '8.5/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '93%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '89/100'
                        }
                      ],
                      'Metascore': '89',
                      'imdbRating': '8.5',
                      'imdbVotes': '1,049,933',
                      'imdbID': 'tt0078748',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$84,206,106',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Star Trek',
                      'Year': '2009',
                      'Rated': 'PG-13',
                      'Released': '08 May 2009',
                      'Runtime': '127 min',
                      'Genre': 'Action, Adventure, Sci-Fi',
                      'Director': 'J.J. Abrams',
                      'Writer': 'Roberto Orci, Alex Kurtzman, Gene Roddenberry',
                      'Actors': 'Chris Pine, Zachary Quinto, Simon Pegg',
                      'Plot': 'The brash James T. Kirk tries to live up to his father´s legacy with Mr. Spock keeping him in check as a vengeful Romulan from the future creates black holes to destroy the Federation one planet at a time.',
                      'Language': 'English',
                      'Country': 'Germany, United States',
                      'Awards': 'Won 1 Oscar. 27 wins & 95 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BMjE5NDQ5OTE4Ml5BMl5BanBnXkFtZTcwOTE3NDIzMw@@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.9/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '94%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '82/100'
                        }
                      ],
                      'Metascore': '82',
                      'imdbRating': '7.9',
                      'imdbVotes': '636,122',
                      'imdbID': 'tt0796366',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$257,730,019',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Shrek',
                      'Year': '2001',
                      'Rated': 'PG',
                      'Released': '18 May 2001',
                      'Runtime': '90 min',
                      'Genre': 'Animation, Adventure, Comedy',
                      'Director': 'Andrew Adamson, Vicky Jenson',
                      'Writer': 'William Steig, Ted Elliott, Terry Rossio',
                      'Actors': 'Mike Myers, Eddie Murphy, Cameron Diaz',
                      'Plot': 'A mean lord exiles fairytale creatures to the swamp of a grumpy ogre, who must go on a quest and rescue a princess for the lord in order to get his land back.',
                      'Language': 'English',
                      'Country': 'United States',
                      'Awards': 'Won 1 Oscar. 40 wins & 60 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BN2FkMTRkNTUtYTI0NC00ZjI4LWI5MzUtMDFmOGY0NmU2OGY1XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.9/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '88%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '84/100'
                        }
                      ],
                      'Metascore': '84',
                      'imdbRating': '7.9',
                      'imdbVotes': '797,094',
                      'imdbID': 'tt0126029',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$268,698,241',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Poor Things',
                      'Year': '2023',
                      'Rated': 'R',
                      'Released': '22 Dec 2023',
                      'Runtime': '141 min',
                      'Genre': 'Comedy, Drama, Romance',
                      'Director': 'Yorgos Lanthimos',
                      'Writer': 'Tony McNamara, Alasdair Gray',
                      'Actors': 'Emma Stone, Mark Ruffalo, Willem Dafoe',
                      'Plot': 'An account of the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.',
                      'Language': 'English, French, Portuguese',
                      'Country': 'Ireland, United Kingdom, United States, Hungary',
                      'Awards': 'Won 4 Oscars. 120 wins & 426 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BYWU2MjRjZTYtMjVkMS00MTBjLWFiMTAtYmZlYTk1YjkyMWFkXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.8/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '92%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '88/100'
                        }
                      ],
                      'Metascore': '88',
                      'imdbRating': '7.8',
                      'imdbVotes': '379,096',
                      'imdbID': 'tt14230458',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$34,553,225',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Batman',
                      'Year': '1989',
                      'Rated': 'PG-13',
                      'Released': '23 Jun 1989',
                      'Runtime': '126 min',
                      'Genre': 'Action, Adventure',
                      'Director': 'Tim Burton',
                      'Writer': 'Bob Kane, Sam Hamm, Warren Skaaren',
                      'Actors': 'Michael Keaton, Jack Nicholson, Kim Basinger',
                      'Plot': 'The Dark Knight of Gotham City begins his war on crime with his first major enemy being Jack Napier, a criminal who becomes the clownishly homicidal Joker.',
                      'Language': 'English, French, Spanish',
                      'Country': 'United States, United Kingdom',
                      'Awards': 'Won 1 Oscar. 13 wins & 30 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BYzZmZWViM2EtNzhlMi00NzBlLWE0MWEtZDFjMjk3YjIyNTBhXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.5/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '77%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '69/100'
                        }
                      ],
                      'Metascore': '69',
                      'imdbRating': '7.5',
                      'imdbVotes': '429,189',
                      'imdbID': 'tt0096895',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$251,409,241',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'SpongeBob SquarePants',
                      'Year': '1999–',
                      'Rated': 'TV-Y7',
                      'Released': '01 May 1999',
                      'Runtime': '23 min',
                      'Genre': 'Animation, Comedy, Family',
                      'Director': 'N/A',
                      'Writer': 'Stephen Hillenburg, Tim Hill, Nick Jennings',
                      'Actors': 'Tom Kenny, Rodger Bumpass, Bill Fagerbakke',
                      'Plot': 'The misadventures of a talking sea sponge who works at a fast food restaurant, attends a boating school, and lives in an underwater pineapple.',
                      'Language': 'English, Irish Gaelic, Korean',
                      'Country': 'United States',
                      'Awards': 'Nominated for 10 Primetime Emmys. 63 wins & 70 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BYjJmMjBkZjMtZThiZS00Nzk3LWJlN2UtYmE5ZjkyNjJiZjgxXkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '8.2/10'
                        }
                      ],
                      'Metascore': 'N/A',
                      'imdbRating': '8.2',
                      'imdbVotes': '123,949',
                      'imdbID': 'tt0206512',
                      'Type': 'series',
                      'totalSeasons': '16',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'The Dark Crystal',
                      'Year': '1982',
                      'Rated': 'PG',
                      'Released': '17 Dec 1982',
                      'Runtime': '93 min',
                      'Genre': 'Adventure, Family, Fantasy',
                      'Director': 'Jim Henson, Frank Oz',
                      'Writer': 'David Odell, Jim Henson',
                      'Actors': 'Jim Henson, Kathryn Mullen, Frank Oz',
                      'Plot': 'On another planet in the distant past, the last of the Gelfling race embarks on a quest to find the missing shard of a magical crystal and to restore order to his world.',
                      'Language': 'English',
                      'Country': 'United Kingdom, United States',
                      'Awards': 'Nominated for 1 BAFTA Award3 wins & 5 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BYTcxY2NiMDAtMjRmYi00ZTUwLTk2NDYtYjI1MDQ4ZDBiMTA5XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.1/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '78%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '66/100'
                        }
                      ],
                      'Metascore': '66',
                      'imdbRating': '7.1',
                      'imdbVotes': '75,510',
                      'imdbID': 'tt0083791',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$41,613,957',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                        'Title':'Avatar',
                        'Year':'2009',
                        'Rated':'PG-13',
                        'Released':'18 Dec 2009',
                        'Runtime':'162 min',
                        'Genre':'Action, Adventure, Fantasy',
                        'Director':'James Cameron',
                        'Writer':'James Cameron',
                        'Actors':'Sam Worthington, Zoe Saldaña, Sigourney Weaver',
                        'Plot':'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
                        'Language':'English, Spanish',
                        'Country':'United States, United Kingdom',
                        'Awards':'Won 3 Oscars. 91 wins & 131 nominations total',
                        'Poster':'https://m.media-amazon.com/images/M/MV5BMDEzMmQwZjctZWU2My00MWNlLWE0NjItMDJlYTRlNGJiZjcyXkEyXkFqcGc@._V1_SX300.jpg',
                        'Ratings':[
                          {'Source':'Internet Movie Database','Value':'7.9/10'},
                          {'Source':'Rotten Tomatoes','Value':'81%'},
                          {'Source':'Metacritic','Value':'83/100'}
                        ],
                        'Metascore':'83',
                        'imdbRating':'7.9',
                        'imdbVotes':'1,468,320',
                        'imdbID':'tt0499549',
                        'Type':'movie',
                        'DVD':'N/A',
                        'BoxOffice':'$785,221,649',
                        'Production':'N/A',
                        'Website':'N/A',
                        'Response':'True'
                    }');",

                @"INSERT INTO movies (movies_raw) VALUES
                    ('{
                      'Title': 'Starship Troopers',
                      'Year': '1997',
                      'Rated': 'R',
                      'Released': '07 Nov 1997',
                      'Runtime': '129 min',
                      'Genre': 'Action, Adventure, Sci-Fi',
                      'Director': 'Paul Verhoeven',
                      'Writer': 'Edward Neumeier, Robert A. Heinlein',
                      'Actors': 'Casper Van Dien, Denise Richards, Dina Meyer',
                      'Plot': 'Humans, in a fascist militaristic future, wage war with giant alien bugs.',
                      'Language': 'English',
                      'Country': 'United States',
                      'Awards': 'Nominated for 1 Oscar. 3 wins & 16 nominations total',
                      'Poster': 'https://m.media-amazon.com/images/M/MV5BZTNiOGM1ZWUtZTZjZC00OWJmLWE2YzUtZjQ4ODZjZmVlMDU3XkEyXkFqcGc@._V1_SX300.jpg',
                      'Ratings': [
                        {
                          'Source': 'Internet Movie Database',
                          'Value': '7.3/10'
                        },
                        {
                          'Source': 'Rotten Tomatoes',
                          'Value': '72%'
                        },
                        {
                          'Source': 'Metacritic',
                          'Value': '52/100'
                        }
                      ],
                      'Metascore': '52',
                      'imdbRating': '7.3',
                      'imdbVotes': '340,192',
                      'imdbID': 'tt0120201',
                      'Type': 'movie',
                      'DVD': 'N/A',
                      'BoxOffice': '$54,814,377',
                      'Production': 'N/A',
                      'Website': 'N/A',
                      'Response': 'True'
                    }');"};
            foreach (var sql in moviesData)
            {
                command.CommandText = sql;
                command.ExecuteNonQuery();
            }
        */
        }
    }

    // Helper to create an object from the DataReader
    private static dynamic ObjFromReader(MySqlDataReader reader)
    {
        var obj = Obj();
        for (var i = 0; i < reader.FieldCount; i++)
        {
            var key = reader.GetName(i);
            var value = reader.GetValue(i);

            // Handle NULL values
            if (value == DBNull.Value)
            {
                obj[key] = null;
            }
            // Handle DateTime - convert to ISO string
            else if (value is DateTime dt)
            {
                obj[key] = dt.ToString("yyyy-MM-ddTHH:mm:ss");
            }
            // Handle boolean (MySQL returns sbyte for TINYINT(1))
            else if (value is sbyte sb)
            {
                obj[key] = sb != 0;
            }
            else if (value is bool b)
            {
                obj[key] = b;
            }
            // Handle JSON columns (MySQL returns JSON as string starting with [ or {)
            else if (value is string strValue && (strValue.StartsWith("[") || strValue.StartsWith("{")))
            {
                try
                {
                    obj[key] = JSON.Parse(strValue);
                }
                catch
                {
                    // If parsing fails, keep the original value and try to convert to number
                    obj[key] = strValue.TryToNum();
                }
            }
            else
            {
                // Normal handling - convert to string and try to parse as number
                obj[key] = value.ToString().TryToNum();
            }
        }
        return obj;
    }

    // Run a query - rows are returned as an array of objects
    public static Arr SQLQuery(
        string sql, object parameters = null, HttpContext context = null
    )
    {
        var paras = parameters == null ? Obj() : Obj(parameters);
        using var db = new MySqlConnection(connectionString);
        db.Open();
        var command = db.CreateCommand();
        command.CommandText = @sql;
        var entries = (Arr)paras.GetEntries();
        entries.ForEach(x => command.Parameters.AddWithValue("@" + x[0], x[1]));
        if (context != null)
        {
            DebugLog.Add(context, new
            {
                sqlQuery = sql.Regplace(@"\s+", " "),
                sqlParams = paras
            });
        }
        var rows = Arr();
        try
        {
            if (sql.StartsWith("SELECT ", true, null))
            {
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    rows.Push(ObjFromReader(reader));
                }
                reader.Close();
            }
            else
            {
                rows.Push(new
                {
                    command = sql.Split(" ")[0].ToUpper(),
                    rowsAffected = command.ExecuteNonQuery()
                });
            }
        }
        catch (Exception err)
        {
            rows.Push(new { error = err.Message });
        }
        return rows;
    }

    // Run a query - only return the first row, as an object
    public static dynamic SQLQueryOne(
        string sql, object parameters = null, HttpContext context = null
    )
    {
        return SQLQuery(sql, parameters, context)[0];
    }
}
