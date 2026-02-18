namespace WebApp;

public static class DbQuery
{
  // Setup the database connection from config
  private static string connectionString;

  // JSON columns for _CONTAINS_ validation
  public static Arr JsonColumns = Arr(new[] { "Genre" });

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

    // Reset database if requested
    if (config.resetDb == true)
    {
        DropTables(db);
    }

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

  private static void DropTables(MySqlConnection db)
  {
    var dropTablesSql = @"
            DROP TABLE IF EXISTS bookingSeats;
            DROP TABLE IF EXISTS bookings;
            DROP TABLE IF EXISTS seats;
            DROP TABLE IF EXISTS viewings;
            DROP TABLE IF EXISTS ticketTypes;
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS lounges;
            DROP TABLE IF EXISTS movies;
            DROP TABLE IF EXISTS acl;
            DROP TABLE IF EXISTS sessions;
        ";

    foreach (var sql in dropTablesSql.Split(';'))
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
                role VARCHAR(50) NOT NULL DEFAULT 'users',
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
                ('visitor, user,admin', '', 'allow', '/api/login', 'true', 'Allow access to all login routes'),
                ('visitor,user,admin', 'POST', 'allow', '/api/chat', 'true', 'Allow all user roles to access AI chat'),
                ('admin', '', 'allow', '/api/users', 'true', 'Allow admins to see and edit users'),
                ('admin', '', 'allow', '/api/sessions', 'true', 'Allow admins to see and edit sessions'),
                ('admin', '', 'allow', '/api/acl', 'true', 'Allow admins to see and edit acl rules'),
                ('visitor,user,admin', 'GET', 'allow', '/api/movies', 'true', 'Allow all user roles to read movies'),
                ('visitor, user,admin', 'GET', 'allow', '/api/viewings/all', 'true', 'Allowing all to visit the /api/viewings/all');
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
    {
      var movieDir = Path.Combine(
          AppContext.BaseDirectory, "..", "..", "..", "..", "public", "movies"
      );

      if (!Directory.Exists(movieDir))
        throw new Exception("Movie directory not found: " + movieDir);

      var files = Directory.GetFiles(movieDir, "*.json");
      if (files.Length == 0)
      {
        throw new Exception("No movie JSON files found in: " + movieDir);
      }

      using var db2 = new MySqlConnection(connectionString);
      db2.Open();

      foreach (var file in files)
      {
        var json = File.ReadAllText(file);

        try
        {
          // Validera JSON innan insert
          JSON.Parse(json);
        }
        catch (Exception ex)
        {
          Console.WriteLine($"JSON validation failed for file {file}: {ex.Message}");
          continue; // hoppa över ogiltiga JSON-filer
        }

        using var cmd = db2.CreateCommand();
        cmd.CommandText = "INSERT INTO movies (movies_raw) VALUES (@json)";
        cmd.Parameters.AddWithValue("@json", json);
        cmd.ExecuteNonQuery();

        Console.WriteLine($"Inserted movie from file: {Path.GetFileName(file)}");
      }
      db2.Close();
    }


    // seed Lounge
    command.CommandText = "SELECT COUNT(*) FROM lounges";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var loungesData = @"
                INSERT INTO lounges (name) VALUES
                ('Stora salongen'),
                ('Lilla salongen');
            ";
      command.CommandText = loungesData;
      command.ExecuteNonQuery();
    }


    // seed viewings
    command.CommandText = "SELECT COUNT(*) FROM viewings";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var viewingsData = @"
                INSERT INTO viewings (movie, lounge, start_time) VALUES

                (1, 1, '2026-03-01 20:00:00'),
                (2, 2, '2026-03-01 21:00:00'),
                (3, 1, '2026-03-01 22:00:00'),
                (4, 2, '2026-03-01 23:00:00'),

                (5, 1, '2026-03-02 20:00:00'),
                (6, 2, '2026-03-02 21:00:00'),
                (7, 1, '2026-03-02 22:00:00'),
                (8, 2, '2026-03-02 23:00:00'),

                (9, 1, '2026-03-03 20:00:00'),
                (10, 2, '2026-03-03 21:00:00'),
                (11, 1, '2026-03-03 22:00:00'),
                (12, 2, '2026-03-03 23:00:00'),

                (13, 1, '2026-03-04 20:00:00'),
                (14, 2, '2026-03-04 21:00:00'),
                (15, 1, '2026-03-04 22:00:00'),
                (16, 2, '2026-03-04 23:00:00'),

                (17, 1, '2026-03-05 20:00:00'),
                (18, 2, '2026-03-05 21:00:00'),
                (19, 1, '2026-03-05 22:00:00'),
                (1, 2, '2026-03-05 23:00:00'),

                (2, 1, '2026-03-06 20:00:00'),
                (3, 2, '2026-03-06 21:00:00'),
                (4, 1, '2026-03-06 22:00:00'),
                (5, 2, '2026-03-06 23:00:00'),

                (6, 1, '2026-03-07 20:00:00'),
                (7, 2, '2026-03-07 21:00:00'),
                (8, 1, '2026-03-07 22:00:00'),
                (9, 2, '2026-03-07 23:00:00'),

                (10, 1, '2026-03-08 20:00:00'),
                (11, 2, '2026-03-08 21:00:00'),
                (12, 1, '2026-03-08 22:00:00'),
                (13, 2, '2026-03-08 23:00:00'),

                (14, 1, '2026-03-09 20:00:00'),
                (15, 2, '2026-03-09 21:00:00'),
                (16, 1, '2026-03-09 22:00:00'),
                (17, 2, '2026-03-09 23:00:00'),

                (18, 1, '2026-03-10 20:00:00'),
                (19, 2, '2026-03-10 21:00:00'),
                (1, 1, '2026-03-10 22:00:00'),
                (2, 2, '2026-03-10 23:00:00'),

                (3, 1, '2026-03-11 20:00:00'),
                (4, 2, '2026-03-11 21:00:00'),
                (5, 1, '2026-03-11 22:00:00'),
                (6, 2, '2026-03-11 23:00:00'),

                (7, 1, '2026-03-12 20:00:00'),
                (8, 2, '2026-03-12 21:00:00'),
                (9, 1, '2026-03-12 22:00:00'),
                (10, 2, '2026-03-12 23:00:00'),

                (11, 1, '2026-03-13 20:00:00'),
                (12, 2, '2026-03-13 21:00:00'),
                (13, 1, '2026-03-13 22:00:00'),
                (14, 2, '2026-03-13 23:00:00'),

                (15, 1, '2026-03-14 20:00:00'),
                (16, 2, '2026-03-14 21:00:00'),
                (17, 1, '2026-03-14 22:00:00'),
                (18, 2, '2026-03-14 23:00:00'),

                (19, 1, '2026-03-15 20:00:00'),
                (1, 2, '2026-03-15 21:00:00'),
                (2, 1, '2026-03-15 22:00:00'),
                (3, 2, '2026-03-15 23:00:00'),

                (4, 1, '2026-03-16 20:00:00'),
                (5, 2, '2026-03-16 21:00:00'),
                (6, 1, '2026-03-16 22:00:00'),
                (7, 2, '2026-03-16 23:00:00'),

                (8, 1, '2026-03-17 20:00:00'),
                (9, 2, '2026-03-17 21:00:00'),
                (10, 1, '2026-03-17 22:00:00'),
                (11, 2, '2026-03-17 23:00:00'),

                (12, 1, '2026-03-18 20:00:00'),
                (13, 2, '2026-03-18 21:00:00'),
                (14, 1, '2026-03-18 22:00:00'),
                (15, 2, '2026-03-18 23:00:00'),

                (16, 1, '2026-03-19 20:00:00'),
                (17, 2, '2026-03-19 21:00:00'),
                (18, 1, '2026-03-19 22:00:00'),
                (19, 2, '2026-03-19 23:00:00'),

                (1, 1, '2026-03-20 20:00:00'),
                (2, 2, '2026-03-20 21:00:00'),
                (3, 1, '2026-03-20 22:00:00'),
                (4, 2, '2026-03-20 23:00:00'),

                (5, 1, '2026-03-21 20:00:00'),
                (6, 2, '2026-03-21 21:00:00'),
                (7, 1, '2026-03-21 22:00:00'),
                (8, 2, '2026-03-21 23:00:00'),

                (9, 1, '2026-03-22 20:00:00'),
                (10, 2, '2026-03-22 21:00:00'),
                (11, 1, '2026-03-22 22:00:00'),
                (12, 2, '2026-03-22 23:00:00'),

                (13, 1, '2026-03-23 20:00:00'),
                (14, 2, '2026-03-23 21:00:00'),
                (15, 1, '2026-03-23 22:00:00'),
                (16, 2, '2026-03-23 23:00:00'),

                (17, 1, '2026-03-24 20:00:00'),
                (18, 2, '2026-03-24 21:00:00'),
                (19, 1, '2026-03-24 22:00:00'),
                (1, 2, '2026-03-24 23:00:00'),

                (2, 1, '2026-03-25 20:00:00'),
                (3, 2, '2026-03-25 21:00:00'),
                (4, 1, '2026-03-25 22:00:00'),
                (5, 2, '2026-03-25 23:00:00'),

                (6, 1, '2026-03-26 20:00:00'),
                (7, 2, '2026-03-26 21:00:00'),
                (8, 1, '2026-03-26 22:00:00'),
                (9, 2, '2026-03-26 23:00:00'),

                (10, 1, '2026-03-27 20:00:00'),
                (11, 2, '2026-03-27 21:00:00'),
                (12, 1, '2026-03-27 22:00:00'),
                (13, 2, '2026-03-27 23:00:00'),

                (14, 1, '2026-03-28 20:00:00'),
                (15, 2, '2026-03-28 21:00:00'),
                (16, 1, '2026-03-28 22:00:00'),
                (17, 2, '2026-03-28 23:00:00'),

                (18, 1, '2026-03-29 20:00:00'),
                (19, 2, '2026-03-29 21:00:00'),
                (1, 1, '2026-03-29 22:00:00'),
                (2, 2, '2026-03-29 23:00:00'),

                (3, 1, '2026-03-30 20:00:00'),
                (4, 2, '2026-03-30 21:00:00'),
                (5, 1, '2026-03-30 22:00:00'),
                (6, 2, '2026-03-30 23:00:00'),

                (7, 1, '2026-03-31 20:00:00'),
                (8, 2, '2026-03-31 21:00:00'),
                (9, 1, '2026-03-31 22:00:00'),
                (10, 2, '2026-03-31 23:00:00'),

                (1, 1, '2026-04-02 20:00:00'),
                (2, 2, '2026-04-02 21:00:00'),
                (3, 1, '2026-04-02 22:00:00'),
                (4, 2, '2026-04-02 23:00:00'),

                (5, 1, '2026-04-03 20:00:00'),
                (6, 2, '2026-04-03 21:00:00'),
                (7, 1, '2026-04-03 22:00:00'),
                (8, 2, '2026-04-03 23:00:00'),

                (9, 1, '2026-04-04 20:00:00'),
                (10, 2, '2026-04-04 21:00:00'),
                (11, 1, '2026-04-04 22:00:00'),
                (12, 2, '2026-04-04 23:00:00'),

                (13, 1, '2026-04-05 20:00:00'),
                (14, 2, '2026-04-05 21:00:00'),
                (15, 1, '2026-04-05 22:00:00'),
                (16, 2, '2026-04-05 23:00:00'),

                (17, 1, '2026-04-06 20:00:00'),
                (18, 2, '2026-04-06 21:00:00'),
                (19, 1, '2026-04-06 22:00:00'),
                (1, 2, '2026-04-06 23:00:00'),

                (2, 1, '2026-04-07 20:00:00'),
                (3, 2, '2026-04-07 21:00:00'),
                (4, 1, '2026-04-07 22:00:00'),
                (5, 2, '2026-04-07 23:00:00'),

                (6, 1, '2026-04-08 20:00:00'),
                (7, 2, '2026-04-08 21:00:00'),
                (8, 1, '2026-04-08 22:00:00'),
                (9, 2, '2026-04-08 23:00:00'),

                (10, 1, '2026-04-09 20:00:00'),
                (11, 2, '2026-04-09 21:00:00'),
                (12, 1, '2026-04-09 22:00:00'),
                (13, 2, '2026-04-09 23:00:00'),

                (14, 1, '2026-04-10 20:00:00'),
                (15, 2, '2026-04-10 21:00:00'),
                (16, 1, '2026-04-10 22:00:00'),
                (17, 2, '2026-04-10 23:00:00'),

                (18, 1, '2026-04-11 20:00:00'),
                (19, 2, '2026-04-11 21:00:00'),
                (1, 1, '2026-04-11 22:00:00'),
                (2, 2, '2026-04-11 23:00:00'),

                (3, 1, '2026-04-12 20:00:00'),
                (4, 2, '2026-04-12 21:00:00'),
                (5, 1, '2026-04-12 22:00:00'),
                (6, 2, '2026-04-12 23:00:00'),

                (7, 1, '2026-04-13 20:00:00'),
                (8, 2, '2026-04-13 21:00:00'),
                (9, 1, '2026-04-13 22:00:00'),
                (10, 2, '2026-04-13 23:00:00'),

                (11, 1, '2026-04-14 20:00:00'),
                (12, 2, '2026-04-14 21:00:00'),
                (13, 1, '2026-04-14 22:00:00'),
                (14, 2, '2026-04-14 23:00:00'),

                (15, 1, '2026-04-15 20:00:00'),
                (16, 2, '2026-04-15 21:00:00'),
                (17, 1, '2026-04-15 22:00:00'),
                (18, 2, '2026-04-15 23:00:00'),

                (19, 1, '2026-04-16 20:00:00'),
                (1, 2, '2026-04-16 21:00:00'),
                (2, 1, '2026-04-16 22:00:00'),
                (3, 2, '2026-04-16 23:00:00'),

                (4, 1, '2026-04-17 20:00:00'),
                (5, 2, '2026-04-17 21:00:00'),
                (6, 1, '2026-04-17 22:00:00'),
                (7, 2, '2026-04-17 23:00:00'),

                (8, 1, '2026-04-18 20:00:00'),
                (9, 2, '2026-04-18 21:00:00'),
                (10, 1, '2026-04-18 22:00:00'),
                (11, 2, '2026-04-18 23:00:00'),

                (12, 1, '2026-04-19 20:00:00'),
                (13, 2, '2026-04-19 21:00:00'),
                (14, 1, '2026-04-19 22:00:00'),
                (15, 2, '2026-04-19 23:00:00'),

                (16, 1, '2026-04-20 20:00:00'),
                (17, 2, '2026-04-20 21:00:00'),
                (18, 1, '2026-04-20 22:00:00'),
                (19, 2, '2026-04-20 23:00:00'),

                (1, 1, '2026-04-21 20:00:00'),
                (2, 2, '2026-04-21 21:00:00'),
                (3, 1, '2026-04-21 22:00:00'),
                (4, 2, '2026-04-21 23:00:00'),

                (5, 1, '2026-04-22 20:00:00'),
                (6, 2, '2026-04-22 21:00:00'),
                (7, 1, '2026-04-22 22:00:00'),
                (8, 2, '2026-04-22 23:00:00'),

                (9, 1, '2026-04-23 20:00:00'),
                (10, 2, '2026-04-23 21:00:00'),
                (11, 1, '2026-04-23 22:00:00'),
                (12, 2, '2026-04-23 23:00:00'),

                (13, 1, '2026-04-24 20:00:00'),
                (14, 2, '2026-04-24 21:00:00'),
                (15, 1, '2026-04-24 22:00:00'),
                (16, 2, '2026-04-24 23:00:00'),

                (17, 1, '2026-04-25 20:00:00'),
                (18, 2, '2026-04-25 21:00:00'),
                (19, 1, '2026-04-25 22:00:00'),
                (1, 2, '2026-04-25 23:00:00'),

                (2, 1, '2026-04-26 20:00:00'),
                (3, 2, '2026-04-26 21:00:00'),
                (4, 1, '2026-04-26 22:00:00'),
                (5, 2, '2026-04-26 23:00:00'),

                (6, 1, '2026-04-27 20:00:00'),
                (7, 2, '2026-04-27 21:00:00'),
                (8, 1, '2026-04-27 22:00:00'),
                (9, 2, '2026-04-27 23:00:00'),

                (10, 1, '2026-04-28 20:00:00'),
                (11, 2, '2026-04-28 21:00:00'),
                (12, 1, '2026-04-28 22:00:00'),
                (13, 2, '2026-04-28 23:00:00'),

                (14, 1, '2026-04-29 20:00:00'),
                (15, 2, '2026-04-29 21:00:00'),
                (16, 1, '2026-04-29 22:00:00'),
                (17, 2, '2026-04-29 23:00:00'),

                (18, 1, '2026-04-30 20:00:00'),
                (19, 2, '2026-04-30 21:00:00'),
                (1, 1, '2026-04-30 22:00:00'),
                (2, 2, '2026-04-30 23:00:00');
            ";
      command.CommandText = viewingsData;
      command.ExecuteNonQuery();
    }


    // seed seats
    command.CommandText = "SELECT COUNT(*) FROM seats";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var seatsData = @"
                INSERT INTO seats (lounge, seatRow, number) VALUES
                (1, '1', 1),
                (1, '1', 2),
                (1, '1', 3),
                (1, '1', 4),
                (1, '1', 5),
                (1, '1', 6),
                (1, '1', 7),
                (1, '1', 8),

                (1, '2', 1),
                (1, '2', 2),
                (1, '2', 3),
                (1, '2', 4),
                (1, '2', 5),
                (1, '2', 6),
                (1, '2', 7),
                (1, '2', 8),
                (1, '2', 9),

                (1, '3', 1),
                (1, '3', 2),
                (1, '3', 3),
                (1, '3', 4),
                (1, '3', 5),
                (1, '3', 6),
                (1, '3', 7),
                (1, '3', 8),
                (1, '3', 9),
                (1, '3', 10),

                (1, '4', 1),
                (1, '4', 2),
                (1, '4', 3),
                (1, '4', 4),
                (1, '4', 5),
                (1, '4', 6),
                (1, '4', 7),
                (1, '4', 8),
                (1, '4', 9),
                (1, '4', 10),

                (1, '5', 1),
                (1, '5', 2),
                (1, '5', 3),
                (1, '5', 4),
                (1, '5', 5),
                (1, '5', 6),
                (1, '5', 7),
                (1, '5', 8),
                (1, '5', 9),
                (1, '5', 10),

                (1, '6', 1),
                (1, '6', 2),
                (1, '6', 3),
                (1, '6', 4),
                (1, '6', 5),
                (1, '6', 6),
                (1, '6', 7),
                (1, '6', 8),
                (1, '6', 9),
                (1, '6', 10),

                (1, '7', 1),
                (1, '7', 2),
                (1, '7', 3),
                (1, '7', 4),
                (1, '7', 5),
                (1, '7', 6),
                (1, '7', 7),
                (1, '7', 8),
                (1, '7', 9),
                (1, '7', 10),
                (1, '7', 11),
                (1, '7', 12),

                (1, '8', 1),
                (1, '8', 2),
                (1, '8', 3),
                (1, '8', 4),
                (1, '8', 5),
                (1, '8', 6),
                (1, '8', 7),
                (1, '8', 8),
                (1, '8', 9),
                (1, '8', 10),
                (1, '8', 11),
                (1, '8', 12),

                (2, '1', 1),
                (2, '1', 2),
                (2, '1', 3),
                (2, '1', 4),
                (2, '1', 5),
                (2, '1', 6),

                (2, '2', 1),
                (2, '2', 2),
                (2, '2', 3),
                (2, '2', 4),
                (2, '2', 5),
                (2, '2', 6),
                (2, '2', 7),
                (2, '2', 8),

                (2, '3', 1),
                (2, '3', 2),
                (2, '3', 3),
                (2, '3', 4),
                (2, '3', 5),
                (2, '3', 6),
                (2, '3', 7),
                (2, '3', 8),
                (2, '3', 9),

                (2, '4', 1),
                (2, '4', 2),
                (2, '4', 3),
                (2, '4', 4),
                (2, '4', 5),
                (2, '4', 6),
                (2, '4', 7),
                (2, '4', 8),
                (2, '4', 9),
                (2, '4', 10),

                (2, '5', 1),
                (2, '5', 2),
                (2, '5', 3),
                (2, '5', 4),
                (2, '5', 5),
                (2, '5', 6),
                (2, '5', 7),
                (2, '5', 8),
                (2, '5', 9),
                (2, '5', 10),

                (2, '6', 1),
                (2, '6', 2),
                (2, '6', 3),
                (2, '6', 4),
                (2, '6', 5),
                (2, '6', 6),
                (2, '6', 7),
                (2, '6', 8),
                (2, '6', 9),
                (2, '6', 10),
                (2, '6', 11),
                (2, '6', 12);
            ";
      command.CommandText = seatsData;
      command.ExecuteNonQuery();
    }


    // seed ticketTypes
    command.CommandText = "SELECT COUNT(*) FROM ticketTypes";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var ticketTypesData = @"
                INSERT INTO ticketTypes (name, price) VALUES
                ('Standard', 140),
                ('Senior', 120),
                ('Child', 80);
            ";
      command.CommandText = ticketTypesData;
      command.ExecuteNonQuery();
    }


    // seed bookings
    command.CommandText = "SELECT COUNT(*) FROM bookings";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var bookingsData = @"
                INSERT INTO bookings (BookingReference, user, email, viewing, status) VALUES
                ('ABC123', 1, 'admin@cinema.se', 1, 'confirmed');
            ";
      command.CommandText = bookingsData;
      command.ExecuteNonQuery();
    }


    // seed bookingSeats 
    command.CommandText = "SELECT COUNT(*) FROM bookingSeats";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var bookingSeatsData = @"
                INSERT INTO bookingSeats (booking, seat, ticketType) VALUES
                (1, 1, 1),
                (1, 2, 1),
                (1, 3, 1),
                (1, 4, 1),
                (1, 5, 1),
                (1, 6, 1),
                (1, 7, 1),
                (1, 8, 1),
                (1, 9, 1),
                (1, 10, 1);
            ";
      command.CommandText = bookingSeatsData;
      command.ExecuteNonQuery();
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
