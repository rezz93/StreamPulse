import { Series, StreamingProvider } from '../src/types';

export const PROVIDERS: StreamingProvider[] = [
  {
    "id": "all",
    "name": "All Providers",
    "badgeColor": "bg-zinc-800 text-zinc-300 border-zinc-700",
    "bgColor": "bg-zinc-800",
    "textColor": "text-white",
    "iconName": "LayoutGrid",
    "accentColor": "#3b82f6"
  },
  {
    "id": "theaters",
    "name": "In Theaters",
    "badgeColor": "bg-amber-500/20 text-amber-300 border-amber-500/40",
    "bgColor": "bg-amber-500",
    "textColor": "text-black",
    "iconName": "Clapperboard",
    "accentColor": "#f59e0b"
  },
  {
    "id": "netflix",
    "name": "Netflix",
    "badgeColor": "bg-red-600/20 text-red-400 border-red-500/30",
    "bgColor": "bg-[#E50914]",
    "textColor": "text-white",
    "iconName": "Tv",
    "accentColor": "#E50914"
  },
  {
    "id": "appletv",
    "name": "Apple TV+",
    "badgeColor": "bg-zinc-700/30 text-zinc-200 border-zinc-600/40",
    "bgColor": "bg-zinc-900",
    "textColor": "text-white",
    "iconName": "Play",
    "accentColor": "#d1d5db"
  },
  {
    "id": "max",
    "name": "Max (HBO)",
    "badgeColor": "bg-blue-600/20 text-blue-400 border-blue-500/30",
    "bgColor": "bg-[#002BE7]",
    "textColor": "text-white",
    "iconName": "Sparkles",
    "accentColor": "#002BE7"
  },
  {
    "id": "prime",
    "name": "Prime Video",
    "badgeColor": "bg-sky-600/20 text-sky-400 border-sky-500/30",
    "bgColor": "bg-[#00A8E1]",
    "textColor": "text-white",
    "iconName": "Video",
    "accentColor": "#00A8E1"
  },
  {
    "id": "mubi",
    "name": "MUBI",
    "badgeColor": "bg-blue-900/30 text-sky-300 border-blue-500/40",
    "bgColor": "bg-[#001489]",
    "textColor": "text-white",
    "iconName": "Film",
    "accentColor": "#0020d6"
  },
  {
    "id": "hulu",
    "name": "Hulu",
    "badgeColor": "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
    "bgColor": "bg-[#1CE783]",
    "textColor": "text-zinc-950",
    "iconName": "MonitorPlay",
    "accentColor": "#1CE783"
  },
  {
    "id": "paramount",
    "name": "Paramount+",
    "badgeColor": "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
    "bgColor": "bg-[#0064FF]",
    "textColor": "text-white",
    "iconName": "Mountain",
    "accentColor": "#0064FF"
  },
  {
    "id": "peacock",
    "name": "Peacock",
    "badgeColor": "bg-amber-600/20 text-amber-400 border-amber-500/30",
    "bgColor": "bg-[#000000]",
    "textColor": "text-white",
    "iconName": "Feather",
    "accentColor": "#EAA800"
  }
];

export const INITIAL_SERIES_DATABASE: Series[] = [
  {
    "id": "severance",
    "imdbId": "tt11280740",
    "title": "Severance",
    "tagline": "Please do not attempt to remember your real life.",
    "synopsis": "Mark Scout leads a team at Lumon Industries, whose employees have undergone a severance procedure, which surgically divides their memories between their work and personal lives.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/548/1371406.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/548/1371406.jpg",
    "providers": [
      "appletv"
    ],
    "primaryProvider": "appletv",
    "genres": [
      "Sci-Fi",
      "Psychological Thriller",
      "Mystery",
      "Drama"
    ],
    "rating": 8.7,
    "ratingCount": "190K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2022,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 19,
    "runtimeMinutes": 53,
    "creator": "Dan Erickson",
    "network": "Apple TV+",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "season_upcoming",
    "renewalBadgeText": "Season 2 Streaming on Apple TV+",
    "nextSeasonNumber": 2,
    "nextSeasonReleaseDate": "2025-01-17",
    "nextSeasonDaysLeft": 0,
    "renewalNewsSummary": "Season 2 brings Mark Scout face-to-face with the terrifying consequences of crossing the severance barrier.",
    "productionNotes": "Directed by Ben Stiller; filmed in New York and New Jersey with expanded Lumon departments.",
    "cast": [
      {
        "name": "Adam Scott",
        "role": "Mark Scout"
      },
      {
        "name": "Patricia Arquette",
        "role": "Harmony Cobel"
      },
      {
        "name": "John Turturro",
        "role": "Irving Bailiff"
      },
      {
        "name": "Christopher Walken",
        "role": "Burt Goodman"
      },
      {
        "name": "Britt Lower",
        "role": "Helly R."
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 9,
        "releaseDate": "2022-02-18",
        "status": "released"
      },
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 10,
        "releaseDate": "2025-01-17",
        "status": "released"
      }
    ]
  },
  {
    "id": "presumed-innocent",
    "imdbId": "tt17677860",
    "title": "Presumed Innocent",
    "tagline": "Truth is just a matter of perspective.",
    "synopsis": "A horrific murder upends the Chicago Prosecuting Attorney's office when chief deputy prosecutor Rusty Sabich is suspected of the crime, testing courtroom loyalties and his marriage.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/520/1301035.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/520/1301035.jpg",
    "providers": [
      "appletv"
    ],
    "primaryProvider": "appletv",
    "genres": [
      "Legal Thriller",
      "Crime",
      "Drama",
      "Mystery"
    ],
    "rating": 7.8,
    "ratingCount": "78K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 8,
    "runtimeMinutes": 45,
    "creator": "David E. Kelley",
    "network": "Apple TV+",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNewOnProvider": true,
    "renewalState": "renewed",
    "renewalBadgeText": "New on Apple TV+ • Season 2 Greenlit",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Became Apple TV+'s most-watched drama series of all time; renewed for Season 2 featuring an entirely new case.",
    "cast": [
      {
        "name": "Jake Gyllenhaal",
        "role": "Rusty Sabich"
      },
      {
        "name": "Ruth Negga",
        "role": "Barbara Sabich"
      },
      {
        "name": "Bill Camp",
        "role": "Raymond Horgan"
      },
      {
        "name": "Peter Sarsgaard",
        "role": "Tommy Molto"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 8,
        "releaseDate": "2024-06-12",
        "status": "released"
      }
    ]
  },
  {
    "id": "bad-monkey",
    "imdbId": "tt15203646",
    "title": "Bad Monkey",
    "tagline": "Paradise with a bite.",
    "synopsis": "Andrew Yancy, formerly of the Miami Police department and now a restaurant inspector in Southern Florida, is pulled into a world of greed and corruption after a tourist fishes up a severed arm.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/528/1321882.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/528/1321882.jpg",
    "providers": [
      "appletv"
    ],
    "primaryProvider": "appletv",
    "genres": [
      "Comedy",
      "Crime",
      "Mystery",
      "Drama"
    ],
    "rating": 7.4,
    "ratingCount": "35K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 10,
    "runtimeMinutes": 50,
    "creator": "Bill Lawrence",
    "network": "Apple TV+",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": false,
    "isNewOnProvider": true,
    "renewalState": "in_production",
    "renewalBadgeText": "New on Apple TV+",
    "renewalNewsSummary": "Created by Bill Lawrence (Ted Lasso) and starring Vince Vaughn in peak comedic form.",
    "cast": [
      {
        "name": "Vince Vaughn",
        "role": "Andrew Yancy"
      },
      {
        "name": "L. Scott Caldwell",
        "role": "Ya-Ya"
      },
      {
        "name": "Rob Delaney",
        "role": "Christopher"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 10,
        "releaseDate": "2024-08-14",
        "status": "released"
      }
    ]
  },
  {
    "id": "slow-horses",
    "imdbId": "tt5875444",
    "title": "Slow Horses",
    "tagline": "MI5's dumping ground for disgraced agents.",
    "synopsis": "A dysfunctional team of MI5 agents and their obnoxious boss, Jackson Lamb, navigate the espionage world to defend England from sinister forces.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/637/1593462.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/637/1593462.jpg",
    "providers": [
      "appletv"
    ],
    "primaryProvider": "appletv",
    "genres": [
      "Spy Thriller",
      "Black Comedy",
      "Drama",
      "Crime"
    ],
    "rating": 8.3,
    "ratingCount": "100K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2022,
    "decade": "2020s",
    "totalSeasons": 4,
    "totalEpisodes": 24,
    "runtimeMinutes": 48,
    "creator": "Will Smith (adapted from Mick Herron)",
    "network": "Apple TV+",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "in_production",
    "renewalBadgeText": "Currently Airing • Season 5 Confirmed",
    "nextSeasonNumber": 5,
    "renewalNewsSummary": "Gary Oldman delivers an Emmy-nominated masterclass as Jackson Lamb; Season 5 currently in post-production.",
    "cast": [
      {
        "name": "Gary Oldman",
        "role": "Jackson Lamb"
      },
      {
        "name": "Jack Lowden",
        "role": "River Cartwright"
      },
      {
        "name": "Kristin Scott Thomas",
        "role": "Diana Taverner"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 4,
        "title": "Season 4",
        "episodeCount": 6,
        "releaseDate": "2024-09-04",
        "status": "released"
      }
    ]
  },
  {
    "id": "ted-lasso",
    "imdbId": "tt10986410",
    "title": "Ted Lasso",
    "tagline": "Kindness makes a comeback.",
    "synopsis": "American college football coach Ted Lasso heads to London to manage AFC Richmond, a struggling English Premier League football team.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/634/1585930.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/634/1585930.jpg",
    "providers": [
      "appletv"
    ],
    "primaryProvider": "appletv",
    "genres": [
      "Comedy",
      "Drama",
      "Sports"
    ],
    "rating": 8.8,
    "ratingCount": "340K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2020,
    "decade": "2020s",
    "totalSeasons": 3,
    "totalEpisodes": 34,
    "runtimeMinutes": 42,
    "creator": "Bill Lawrence, Jason Sudeikis, Brendan Hunt",
    "network": "Apple TV+",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "renewalState": "renewed",
    "renewalBadgeText": "Your Next Watch on Apple TV+ • S4 in Works",
    "nextSeasonNumber": 4,
    "renewalNewsSummary": "Warner Bros. Television officially picked up options for core cast for Season 4 production.",
    "cast": [
      {
        "name": "Jason Sudeikis",
        "role": "Ted Lasso"
      },
      {
        "name": "Hannah Waddingham",
        "role": "Rebecca Welton"
      },
      {
        "name": "Brett Goldstein",
        "role": "Roy Kent"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 3,
        "title": "Season 3",
        "episodeCount": 12,
        "releaseDate": "2023-03-15",
        "status": "released"
      }
    ]
  },
  {
    "id": "silo",
    "imdbId": "tt14688458",
    "title": "Silo",
    "tagline": "If the lies don't kill you, the truth will.",
    "synopsis": "Men and women live in a giant subterranean silo with strict regulations which they believe are meant to protect them from the toxic world outside.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/631/1577677.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/631/1577677.jpg",
    "providers": [
      "appletv"
    ],
    "primaryProvider": "appletv",
    "genres": [
      "Sci-Fi",
      "Dystopian",
      "Mystery",
      "Drama"
    ],
    "rating": 8.1,
    "ratingCount": "140K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2023,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 20,
    "runtimeMinutes": 52,
    "creator": "Graham Yost (Hugh Howey Novel)",
    "network": "Apple TV+",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "airing_now",
    "renewalBadgeText": "Season 2 Currently Airing",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Season 2 uncovers the horrifying reality of Silo 17 and what lies beyond.",
    "cast": [
      {
        "name": "Rebecca Ferguson",
        "role": "Juliette Nichols"
      },
      {
        "name": "Common",
        "role": "Robert Sims"
      },
      {
        "name": "Tim Robbins",
        "role": "Bernard Holland"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 10,
        "releaseDate": "2024-11-15",
        "status": "released"
      }
    ]
  },
  {
    "id": "3-body-problem",
    "imdbId": "tt13016388",
    "title": "3 Body Problem",
    "tagline": "Their world was broken. Ours is next.",
    "synopsis": "A fateful decision made in 1960s China echoes across space and time to a group of scientists in the present day, forcing them to face humanity's greatest threat.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/507/1268925.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/507/1268925.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Sci-Fi",
      "Mystery",
      "Drama",
      "Adventure"
    ],
    "rating": 7.6,
    "ratingCount": "195K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 8,
    "runtimeMinutes": 58,
    "creator": "David Benioff, D.B. Weiss, Alexander Woo",
    "network": "Netflix",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNewOnProvider": true,
    "renewalState": "in_production",
    "renewalBadgeText": "New on Netflix • Renewed Through S3",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Netflix renewed the epic sci-fi series through its full three-book conclusion.",
    "cast": [
      {
        "name": "Jess Hong",
        "role": "Jin Cheng"
      },
      {
        "name": "Benedict Wong",
        "role": "Da Shi"
      },
      {
        "name": "Eiza González",
        "role": "Auggie Salazar"
      },
      {
        "name": "Liam Cunningham",
        "role": "Thomas Wade"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 8,
        "releaseDate": "2024-03-21",
        "status": "released"
      }
    ]
  },
  {
    "id": "ripley",
    "imdbId": "tt11016042",
    "title": "Ripley",
    "tagline": "Every con has its masterpiece.",
    "synopsis": "Tom Ripley, a grifter scraping by in early 1960s New York, is hired by a wealthy man to travel to Italy and convince his vagabond son to return home. Tom's acceptance of the job is the first step into a complex life of deceit, fraud, and murder.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/500/1252264.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/500/1252264.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Psychological Thriller",
      "Crime",
      "Drama",
      "Neo-Noir"
    ],
    "rating": 8.2,
    "ratingCount": "70K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 8,
    "runtimeMinutes": 55,
    "creator": "Steven Zaillian",
    "network": "Netflix",
    "status": "Ended",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": false,
    "isNewOnProvider": true,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "New on Netflix • Emmy Winner",
    "renewalNewsSummary": "Won 4 Primetime Emmy Awards including Outstanding Directing for Steven Zaillian.",
    "cast": [
      {
        "name": "Andrew Scott",
        "role": "Tom Ripley"
      },
      {
        "name": "Dakota Fanning",
        "role": "Marge Sherwood"
      },
      {
        "name": "Johnny Flynn",
        "role": "Dickie Greenleaf"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Limited Series",
        "episodeCount": 8,
        "releaseDate": "2024-04-04",
        "status": "released"
      }
    ]
  },
  {
    "id": "baby-reindeer",
    "imdbId": "tt13649692",
    "title": "Baby Reindeer",
    "tagline": "A compelling, deeply uncomfortable true story.",
    "synopsis": "When a struggling comedian shows a flash of kindness to a vulnerable woman, it unleashes a suffocating obsession that threatens to destroy both their lives.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/578/1447075.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/578/1447075.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Psychological Drama",
      "Black Comedy",
      "Biography"
    ],
    "rating": 7.8,
    "ratingCount": "150K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 7,
    "runtimeMinutes": 34,
    "creator": "Richard Gadd",
    "network": "Netflix",
    "status": "Ended",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": false,
    "isNewOnProvider": true,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "New on Netflix • 6 Emmy Awards",
    "renewalNewsSummary": "Swept the 76th Primetime Emmy Awards including Outstanding Limited Series.",
    "cast": [
      {
        "name": "Richard Gadd",
        "role": "Donny Dunn"
      },
      {
        "name": "Jessica Gunning",
        "role": "Martha Scott"
      },
      {
        "name": "Nava Mau",
        "role": "Teri"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Limited Series",
        "episodeCount": 7,
        "releaseDate": "2024-04-11",
        "status": "released"
      }
    ]
  },
  {
    "id": "stranger-things",
    "imdbId": "tt4574334",
    "title": "Stranger Things",
    "tagline": "One summer can change everything.",
    "synopsis": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Sci-Fi",
      "Horror",
      "Drama",
      "Supernatural"
    ],
    "rating": 8.7,
    "ratingCount": "1.3M+",
    "contentRating": "TV-14",
    "firstAirYear": 2016,
    "decade": "2010s",
    "totalSeasons": 5,
    "totalEpisodes": 42,
    "runtimeMinutes": 51,
    "creator": "The Duffer Brothers",
    "network": "Netflix",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": true,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "renewalState": "in_production",
    "renewalBadgeText": "Your Next Watch • Final Season in 2025",
    "nextSeasonNumber": 5,
    "nextSeasonReleaseDate": "2025-10-31",
    "nextSeasonDaysLeft": 230,
    "renewalNewsSummary": "The Duffer Brothers are wrapping production on the final season, featuring feature-film length episodes.",
    "cast": [
      {
        "name": "Millie Bobby Brown",
        "role": "Eleven"
      },
      {
        "name": "Finn Wolfhard",
        "role": "Mike Wheeler"
      },
      {
        "name": "David Harbour",
        "role": "Jim Hopper"
      },
      {
        "name": "Winona Ryder",
        "role": "Joyce Byers"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 4,
        "title": "Season 4",
        "episodeCount": 9,
        "releaseDate": "2022-05-27",
        "status": "released"
      },
      {
        "seasonNumber": 5,
        "title": "Season 5 (Final)",
        "episodeCount": 8,
        "releaseDate": "2025-10-31",
        "status": "upcoming",
        "countdownDays": 230
      }
    ]
  },
  {
    "id": "squid-game",
    "imdbId": "tt10919420",
    "title": "Squid Game",
    "tagline": "45.6 billion won is child's play.",
    "synopsis": "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/576/1440521.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Thriller",
      "Survival Drama",
      "Mystery"
    ],
    "rating": 8,
    "ratingCount": "620K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2021,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 15,
    "runtimeMinutes": 55,
    "creator": "Hwang Dong-hyuk",
    "network": "Netflix",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "airing_now",
    "renewalBadgeText": "Currently Airing on Netflix",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Season 2 follows Gi-hun abandoning his trip to the United States to dismantle the games from within.",
    "cast": [
      {
        "name": "Lee Jung-jae",
        "role": "Seong Gi-hun"
      },
      {
        "name": "Lee Byung-hun",
        "role": "Front Man"
      },
      {
        "name": "Wi Ha-jun",
        "role": "Hwang Jun-ho"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 9,
        "releaseDate": "2021-09-17",
        "status": "released"
      },
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 6,
        "releaseDate": "2024-12-26",
        "status": "released"
      }
    ]
  },
  {
    "id": "cobra-kai",
    "imdbId": "tt7221388",
    "title": "Cobra Kai",
    "tagline": "The battle for the soul of the Valley.",
    "synopsis": "Decades after their 1984 All Valley Karate Tournament bout, a down-and-out Johnny Lawrence seeks redemption by reopening the infamous Cobra Kai dojo.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/536/1340290.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/536/1340290.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Action",
      "Comedy",
      "Martial Arts",
      "Drama"
    ],
    "rating": 8.5,
    "ratingCount": "210K+",
    "contentRating": "TV-14",
    "firstAirYear": 2018,
    "decade": "2010s",
    "totalSeasons": 6,
    "totalEpisodes": 65,
    "runtimeMinutes": 35,
    "creator": "Josh Heald, Jon Hurwitz, Hayden Schlossberg",
    "network": "Netflix",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isCurrentlyAiring": true,
    "renewalState": "airing_now",
    "renewalBadgeText": "Currently Airing Final Season Part 2",
    "nextSeasonNumber": 6,
    "renewalNewsSummary": "Season 6 3-part event concludes the epic karate saga with the Sekai Taikai world championship.",
    "cast": [
      {
        "name": "Ralph Macchio",
        "role": "Daniel LaRusso"
      },
      {
        "name": "William Zabka",
        "role": "Johnny Lawrence"
      },
      {
        "name": "Xolo Maridueña",
        "role": "Miguel Diaz"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 6,
        "title": "Season 6",
        "episodeCount": 15,
        "releaseDate": "2024-07-18",
        "status": "released"
      }
    ]
  },
  {
    "id": "dark",
    "imdbId": "tt5753856",
    "title": "Dark",
    "tagline": "The question is not where, but when.",
    "synopsis": "A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families across different eras.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/504/1262352.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/504/1262352.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Sci-Fi",
      "Mystery",
      "Time Travel",
      "Drama"
    ],
    "rating": 8.7,
    "ratingCount": "440K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2017,
    "decade": "2010s",
    "totalSeasons": 3,
    "totalEpisodes": 26,
    "runtimeMinutes": 53,
    "creator": "Baran bo Odar & Jantje Friese",
    "network": "Netflix",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": true,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Your Next Watch on Netflix",
    "cast": [
      {
        "name": "Louis Hofmann",
        "role": "Jonas Kahnwald"
      },
      {
        "name": "Oliver Masucci",
        "role": "Ulrich Nielsen"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 3,
        "title": "Season 3",
        "episodeCount": 8,
        "releaseDate": "2020-06-27",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-penguin",
    "imdbId": "tt15474916",
    "title": "The Penguin",
    "tagline": "Gotham belongs to him.",
    "synopsis": "Following the events of The Batman (2022), Oswald \"Oz\" Cobb strives to seize control of the crime underworld in Gotham City.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/536/1340329.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/536/1340329.jpg",
    "providers": [
      "max"
    ],
    "primaryProvider": "max",
    "genres": [
      "Crime",
      "Drama",
      "Noir",
      "Comic Book"
    ],
    "rating": 8.8,
    "ratingCount": "160K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 8,
    "runtimeMinutes": 56,
    "creator": "Lauren LeFranc",
    "network": "HBO / Max",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNewOnProvider": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "renewed",
    "renewalBadgeText": "New on Max • Season 2 in Development",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Colin Farrell and Cristin Milioti delivered career-defining performances; directly leads into The Batman Part II.",
    "cast": [
      {
        "name": "Colin Farrell",
        "role": "Oz Cobb / The Penguin"
      },
      {
        "name": "Cristin Milioti",
        "role": "Sofia Falcone"
      },
      {
        "name": "Rhenzy Feliz",
        "role": "Victor Aguilar"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 8,
        "releaseDate": "2024-09-19",
        "status": "released"
      }
    ]
  },
  {
    "id": "house-of-the-dragon",
    "imdbId": "tt11198330",
    "title": "House of the Dragon",
    "tagline": "All must choose.",
    "synopsis": "An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/627/1568449.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/627/1568449.jpg",
    "providers": [
      "max"
    ],
    "primaryProvider": "max",
    "genres": [
      "Fantasy",
      "Action",
      "Drama"
    ],
    "rating": 8.4,
    "ratingCount": "410K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2022,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 18,
    "runtimeMinutes": 62,
    "creator": "Ryan J. Condal & George R.R. Martin",
    "network": "HBO / Max",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "in_production",
    "renewalBadgeText": "Currently Airing • Season 3 in 2026",
    "nextSeasonNumber": 3,
    "renewalNewsSummary": "Showrunner Ryan Condal confirmed the Dance of Dragons will conclude with Season 4.",
    "cast": [
      {
        "name": "Emma D'Arcy",
        "role": "Rhaenyra Targaryen"
      },
      {
        "name": "Matt Smith",
        "role": "Daemon Targaryen"
      },
      {
        "name": "Olivia Cooke",
        "role": "Alicent Hightower"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 8,
        "releaseDate": "2024-06-16",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-last-of-us",
    "imdbId": "tt3581920",
    "title": "The Last of Us",
    "tagline": "When you're lost in the darkness, look for the light.",
    "synopsis": "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/563/1409008.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/563/1409008.jpg",
    "providers": [
      "max"
    ],
    "primaryProvider": "max",
    "genres": [
      "Drama",
      "Action",
      "Post-Apocalyptic",
      "Horror"
    ],
    "rating": 8.8,
    "ratingCount": "580K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2023,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 16,
    "runtimeMinutes": 60,
    "creator": "Craig Mazin & Neil Druckmann",
    "network": "HBO / Max",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": true,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "renewalState": "season_upcoming",
    "renewalBadgeText": "Your Next Watch • Season 2 Spring 2025",
    "nextSeasonNumber": 2,
    "nextSeasonReleaseDate": "2025-04-15",
    "nextSeasonDaysLeft": 38,
    "renewalNewsSummary": "Season 2 introduces Kaitlyn Dever as Abby and Jeffrey Wright reprising Isaac.",
    "cast": [
      {
        "name": "Pedro Pascal",
        "role": "Joel Miller"
      },
      {
        "name": "Bella Ramsey",
        "role": "Ellie Williams"
      },
      {
        "name": "Kaitlyn Dever",
        "role": "Abby Anderson"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 9,
        "releaseDate": "2023-01-15",
        "status": "released"
      },
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 7,
        "releaseDate": "2025-04-15",
        "status": "upcoming",
        "countdownDays": 38
      }
    ]
  },
  {
    "id": "succession",
    "imdbId": "tt7660850",
    "title": "Succession",
    "tagline": "Who will rule?",
    "synopsis": "The Roy family is known for controlling Waystar RoyCo, one of the biggest media and entertainment conglomerates in the world. However, the aging patriarch's sudden health decline sparks a cutthroat succession war.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/453/1134275.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/453/1134275.jpg",
    "providers": [
      "max"
    ],
    "primaryProvider": "max",
    "genres": [
      "Satire",
      "Drama",
      "Corporate Intrigue"
    ],
    "rating": 8.9,
    "ratingCount": "310K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2018,
    "decade": "2010s",
    "totalSeasons": 4,
    "totalEpisodes": 39,
    "runtimeMinutes": 60,
    "creator": "Jesse Armstrong",
    "network": "HBO / Max",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": true,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Masterpiece on Max • Multi-Emmy Winner",
    "cast": [
      {
        "name": "Brian Cox",
        "role": "Logan Roy"
      },
      {
        "name": "Jeremy Strong",
        "role": "Kendall Roy"
      },
      {
        "name": "Sarah Snook",
        "role": "Shiv Roy"
      },
      {
        "name": "Kieran Culkin",
        "role": "Roman Roy"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 4,
        "title": "Season 4",
        "episodeCount": 10,
        "releaseDate": "2023-03-26",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-white-lotus",
    "imdbId": "tt13406094",
    "title": "The White Lotus",
    "tagline": "Aloha was just the beginning.",
    "synopsis": "A sharp social satire following the exploits of various employees and guests at an exclusive Hawaiian and Sicilian resort over the span of a week.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/557/1393876.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/557/1393876.jpg",
    "providers": [
      "max"
    ],
    "primaryProvider": "max",
    "genres": [
      "Black Comedy",
      "Drama",
      "Satire",
      "Mystery"
    ],
    "rating": 8,
    "ratingCount": "210K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2021,
    "decade": "2020s",
    "totalSeasons": 3,
    "totalEpisodes": 20,
    "runtimeMinutes": 58,
    "creator": "Mike White",
    "network": "HBO / Max",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": true,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "renewalState": "season_upcoming",
    "renewalBadgeText": "Your Next Watch • S3 Set in Thailand",
    "nextSeasonNumber": 3,
    "nextSeasonReleaseDate": "2025-05-15",
    "nextSeasonDaysLeft": 68,
    "renewalNewsSummary": "Mike White's third installment explores spirituality and death in Thailand.",
    "cast": [
      {
        "name": "Carrie Coon",
        "role": "TBA"
      },
      {
        "name": "Walton Goggins",
        "role": "TBA"
      },
      {
        "name": "Parker Posey",
        "role": "TBA"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 2,
        "title": "Season 2 (Sicily)",
        "episodeCount": 7,
        "releaseDate": "2022-10-30",
        "status": "released"
      },
      {
        "seasonNumber": 3,
        "title": "Season 3 (Thailand)",
        "episodeCount": 7,
        "releaseDate": "2025-05-15",
        "status": "upcoming",
        "countdownDays": 68
      }
    ]
  },
  {
    "id": "fallout",
    "imdbId": "tt12637874",
    "title": "Fallout",
    "tagline": "Please stand by.",
    "synopsis": "In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/599/1499142.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/599/1499142.jpg",
    "providers": [
      "prime"
    ],
    "primaryProvider": "prime",
    "genres": [
      "Sci-Fi",
      "Action",
      "Dark Comedy",
      "Adventure"
    ],
    "rating": 8.4,
    "ratingCount": "240K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 16,
    "runtimeMinutes": 58,
    "creator": "Geneva Robertson-Dworet & Graham Wagner",
    "network": "Amazon Prime Video",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNewOnProvider": true,
    "isNextWatch": true,
    "renewalState": "in_production",
    "renewalBadgeText": "New on Prime • Season 2 Filming",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Renewed for Season 2 after scoring 16 Emmy nominations; production moving to California and New Vegas.",
    "cast": [
      {
        "name": "Ella Purnell",
        "role": "Lucy MacLean"
      },
      {
        "name": "Walton Goggins",
        "role": "The Ghoul / Cooper Howard"
      },
      {
        "name": "Aaron Moten",
        "role": "Maximus"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 8,
        "releaseDate": "2024-04-10",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-boys",
    "imdbId": "tt1190634",
    "title": "The Boys",
    "tagline": "Never meet your heroes.",
    "synopsis": "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers, backed by the sinister conglomerate Vought International.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/619/1547768.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/619/1547768.jpg",
    "providers": [
      "prime"
    ],
    "primaryProvider": "prime",
    "genres": [
      "Superhero Satire",
      "Action",
      "Dark Comedy"
    ],
    "rating": 8.7,
    "ratingCount": "690K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2019,
    "decade": "2010s",
    "totalSeasons": 5,
    "totalEpisodes": 40,
    "runtimeMinutes": 60,
    "creator": "Eric Kripke",
    "network": "Amazon Prime Video",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "in_production",
    "renewalBadgeText": "Currently Airing • Season 5 Final Season",
    "nextSeasonNumber": 5,
    "renewalNewsSummary": "Eric Kripke confirmed Season 5 will be the definitive series finale.",
    "cast": [
      {
        "name": "Karl Urban",
        "role": "Billy Butcher"
      },
      {
        "name": "Antony Starr",
        "role": "Homelander"
      },
      {
        "name": "Jack Quaid",
        "role": "Hughie Campbell"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 4,
        "title": "Season 4",
        "episodeCount": 8,
        "releaseDate": "2024-06-13",
        "status": "released"
      }
    ]
  },
  {
    "id": "reacher",
    "imdbId": "tt9288030",
    "title": "Reacher",
    "tagline": "Payback's a beast.",
    "synopsis": "Jack Reacher, a veteran military police investigator, is falsely accused of murder. Now he must survive and expose a deadly conspiracy.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/636/1591350.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/636/1591350.jpg",
    "providers": [
      "prime"
    ],
    "primaryProvider": "prime",
    "genres": [
      "Action",
      "Crime",
      "Thriller",
      "Mystery"
    ],
    "rating": 8.1,
    "ratingCount": "220K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2022,
    "decade": "2020s",
    "totalSeasons": 3,
    "totalEpisodes": 24,
    "runtimeMinutes": 49,
    "creator": "Nick Santora (Lee Child Novel)",
    "network": "Amazon Prime Video",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": true,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "renewalState": "season_upcoming",
    "renewalBadgeText": "Your Next Watch • Season 3 Upcoming",
    "nextSeasonNumber": 3,
    "nextSeasonReleaseDate": "2025-03-28",
    "nextSeasonDaysLeft": 20,
    "renewalNewsSummary": "Season 3 adapts the fan-favorite novel Persuader; already renewed for Season 4.",
    "cast": [
      {
        "name": "Alan Ritchson",
        "role": "Jack Reacher"
      },
      {
        "name": "Maria Sten",
        "role": "Frances Neagley"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 8,
        "releaseDate": "2023-12-15",
        "status": "released"
      },
      {
        "seasonNumber": 3,
        "title": "Season 3",
        "episodeCount": 8,
        "releaseDate": "2025-03-28",
        "status": "upcoming",
        "countdownDays": 20
      }
    ]
  },
  {
    "id": "andor",
    "imdbId": "tt9253284",
    "title": "Star Wars: Andor",
    "tagline": "Rebellions are built on hope.",
    "synopsis": "Prequel series to Star Wars' 'Rogue One'. In an era filled with danger, deception and intrigue, Cassian Andor will embark on the path that is destined to turn him into a Rebel hero.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/564/1411766.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/564/1411766.jpg",
    "providers": [
      "hulu"
    ],
    "primaryProvider": "hulu",
    "genres": [
      "Sci-Fi",
      "Political Thriller",
      "Espionage",
      "Drama"
    ],
    "rating": 8.4,
    "ratingCount": "190K+",
    "contentRating": "TV-14",
    "firstAirYear": 2022,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 24,
    "runtimeMinutes": 48,
    "creator": "Tony Gilroy",
    "network": "Lucasfilm / Hulu",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": true,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "season_upcoming",
    "renewalBadgeText": "Season 2 Premiere April 22, 2025",
    "nextSeasonNumber": 2,
    "nextSeasonReleaseDate": "2025-04-22",
    "nextSeasonDaysLeft": 45,
    "renewalNewsSummary": "Season 2 spans four years leading directly into the opening moments of Rogue One: A Star Wars Story.",
    "cast": [
      {
        "name": "Diego Luna",
        "role": "Cassian Andor"
      },
      {
        "name": "Stellan Skarsgård",
        "role": "Luthen Rael"
      },
      {
        "name": "Genevieve O'Reilly",
        "role": "Mon Mothma"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 12,
        "releaseDate": "2022-09-21",
        "status": "released"
      },
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 12,
        "releaseDate": "2025-04-22",
        "status": "upcoming",
        "countdownDays": 45
      }
    ]
  },
  {
    "id": "agatha-all-along",
    "imdbId": "tt15509968",
    "title": "Agatha All Along",
    "tagline": "The coven has gathered.",
    "synopsis": "A spell-bound Agatha Harkness regains freedom thanks to a cynical teen's help. Intrigued by his plea, she embarks on the Witches' Road trials to reclaim her lost powers.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/536/1340567.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/536/1340567.jpg",
    "providers": [
      "hulu"
    ],
    "primaryProvider": "hulu",
    "genres": [
      "Dark Fantasy",
      "Comedy",
      "Supernatural",
      "Mystery"
    ],
    "rating": 7.2,
    "ratingCount": "80K+",
    "contentRating": "TV-14",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 9,
    "runtimeMinutes": 42,
    "creator": "Jac Schaeffer",
    "network": "Marvel Studios / Hulu",
    "status": "Ended",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": false,
    "isNewOnProvider": true,
    "isCurrentlyAiring": true,
    "renewalState": "concluded",
    "renewalBadgeText": "New on Hulu",
    "renewalNewsSummary": "Acclaimed follow-up to WandaVision, dominating streaming charts.",
    "cast": [
      {
        "name": "Kathryn Hahn",
        "role": "Agatha Harkness"
      },
      {
        "name": "Joe Locke",
        "role": "Billy Maximoff / Teen"
      },
      {
        "name": "Aubrey Plaza",
        "role": "Rio Vidal / Death"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Complete Series",
        "episodeCount": 9,
        "releaseDate": "2024-09-18",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-mandalorian",
    "imdbId": "tt8111088",
    "title": "The Mandalorian",
    "tagline": "Bounty hunting is a complicated profession.",
    "synopsis": "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/501/1253498.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/501/1253498.jpg",
    "providers": [
      "prime"
    ],
    "primaryProvider": "prime",
    "genres": [
      "Sci-Fi",
      "Space Western",
      "Adventure"
    ],
    "rating": 8.6,
    "ratingCount": "580K+",
    "contentRating": "TV-14",
    "firstAirYear": 2019,
    "decade": "2010s",
    "totalSeasons": 3,
    "totalEpisodes": 24,
    "runtimeMinutes": 40,
    "creator": "Jon Favreau",
    "network": "Lucasfilm / Prime Video",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "renewalState": "in_production",
    "renewalBadgeText": "Your Next Watch on Prime Video",
    "renewalNewsSummary": "Next chapter expands into the feature film The Mandalorian & Grogu directed by Jon Favreau.",
    "cast": [
      {
        "name": "Pedro Pascal",
        "role": "Din Djarin / The Mandalorian"
      },
      {
        "name": "Carl Weathers",
        "role": "Greef Karga"
      },
      {
        "name": "Katee Sackhoff",
        "role": "Bo-Katan Kryze"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 3,
        "title": "Season 3",
        "episodeCount": 8,
        "releaseDate": "2023-03-01",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-bear",
    "imdbId": "tt14452776",
    "title": "The Bear",
    "tagline": "Every second counts.",
    "synopsis": "A young chef from the fine dining world comes home to Chicago to run his family Italian beef sandwich shop after a heartbreaking death in his family.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/629/1574642.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/629/1574642.jpg",
    "providers": [
      "hulu"
    ],
    "primaryProvider": "hulu",
    "genres": [
      "Culinary Drama",
      "Comedy-Drama",
      "Psychological"
    ],
    "rating": 8.6,
    "ratingCount": "280K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2022,
    "decade": "2020s",
    "totalSeasons": 3,
    "totalEpisodes": 28,
    "runtimeMinutes": 32,
    "creator": "Christopher Storer",
    "network": "FX on Hulu",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "in_production",
    "renewalBadgeText": "Currently Airing • Season 4 Filming",
    "nextSeasonNumber": 4,
    "renewalNewsSummary": "Swept 11 Emmy Awards for Season 2; Season 4 filmed back-to-back in Chicago.",
    "cast": [
      {
        "name": "Jeremy Allen White",
        "role": "Carmen \"Carmy\" Berzatto"
      },
      {
        "name": "Ebon Moss-Bachrach",
        "role": "Richard \"Richie\" Jerimovich"
      },
      {
        "name": "Ayo Edebiri",
        "role": "Sydney Adamu"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 3,
        "title": "Season 3",
        "episodeCount": 10,
        "releaseDate": "2024-06-26",
        "status": "released"
      }
    ]
  },
  {
    "id": "shogun",
    "imdbId": "tt2788316",
    "title": "Shogun",
    "tagline": "Destiny is a beast with two heads.",
    "synopsis": "When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power and devastate his formidable enemies.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/506/1265637.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/506/1265637.jpg",
    "providers": [
      "hulu"
    ],
    "primaryProvider": "hulu",
    "genres": [
      "Historical Epic",
      "Drama",
      "War",
      "Political Drama"
    ],
    "rating": 8.7,
    "ratingCount": "190K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 10,
    "runtimeMinutes": 60,
    "creator": "Rachel Kondo & Justin Marks",
    "network": "FX on Hulu",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNewOnProvider": true,
    "isNextWatch": true,
    "renewalState": "renewed",
    "renewalBadgeText": "New on Hulu • Record 18 Emmy Wins",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Made history with 18 Emmy wins in a single season; FX has officially greenlit Seasons 2 & 3.",
    "cast": [
      {
        "name": "Hiroyuki Sanada",
        "role": "Lord Yoshii Toranaga"
      },
      {
        "name": "Cosmo Jarvis",
        "role": "John Blackthorne"
      },
      {
        "name": "Anna Sawai",
        "role": "Toda Mariko"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 10,
        "releaseDate": "2024-02-27",
        "status": "released"
      }
    ]
  },
  {
    "id": "only-murders-in-the-building",
    "imdbId": "tt11691774",
    "title": "Only Murders in the Building",
    "tagline": "True crime meets high society.",
    "synopsis": "Three strangers who share an obsession with true crime podcasts suddenly find themselves wrapped up in one when a gruesome death occurs inside their exclusive Upper West Side apartment building.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/586/1466415.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/586/1466415.jpg",
    "providers": [
      "hulu"
    ],
    "primaryProvider": "hulu",
    "genres": [
      "Mystery",
      "Comedy",
      "Crime"
    ],
    "rating": 8.1,
    "ratingCount": "170K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2021,
    "decade": "2020s",
    "totalSeasons": 4,
    "totalEpisodes": 40,
    "runtimeMinutes": 34,
    "creator": "Steve Martin & John Hoffman",
    "network": "Hulu",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "renewed",
    "renewalBadgeText": "Currently Airing • Renewed for Season 5",
    "nextSeasonNumber": 5,
    "renewalNewsSummary": "Hulu renewed the hit mystery comedy for Season 5 following the Los Angeles-set Season 4.",
    "cast": [
      {
        "name": "Steve Martin",
        "role": "Charles-Haden Savage"
      },
      {
        "name": "Martin Short",
        "role": "Oliver Putnam"
      },
      {
        "name": "Selena Gomez",
        "role": "Mabel Mora"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 4,
        "title": "Season 4",
        "episodeCount": 10,
        "releaseDate": "2024-08-27",
        "status": "released"
      }
    ]
  },
  {
    "id": "yellowstone",
    "imdbId": "tt4236770",
    "title": "Yellowstone",
    "tagline": "Power has a price.",
    "synopsis": "A ranching family in Montana faces off against others encroaching on their land, battling developers, an Indian reservation, and America's first national park.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/545/1362616.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/545/1362616.jpg",
    "providers": [
      "paramount",
      "peacock"
    ],
    "primaryProvider": "paramount",
    "genres": [
      "Western",
      "Neo-Western",
      "Drama"
    ],
    "rating": 8.7,
    "ratingCount": "245K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2018,
    "decade": "2010s",
    "totalSeasons": 5,
    "totalEpisodes": 53,
    "runtimeMinutes": 52,
    "creator": "Taylor Sheridan & John Linson",
    "network": "Paramount Network / Paramount+",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "airing_now",
    "renewalBadgeText": "Currently Airing Final Episodes",
    "nextSeasonNumber": 5,
    "renewalNewsSummary": "Season 5 Part 2 delivers the monumental conclusion of the Dutton family saga.",
    "cast": [
      {
        "name": "Kelly Reilly",
        "role": "Beth Dutton"
      },
      {
        "name": "Cole Hauser",
        "role": "Rip Wheeler"
      },
      {
        "name": "Luke Grimes",
        "role": "Kayce Dutton"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 5,
        "title": "Season 5",
        "episodeCount": 14,
        "releaseDate": "2024-11-10",
        "status": "released"
      }
    ]
  },
  {
    "id": "tulsa-king",
    "imdbId": "tt16358384",
    "title": "Tulsa King",
    "tagline": "New territory. Same boss.",
    "synopsis": "Following his release from prison, mafia capo Dwight \"The General\" Manfredi is exiled to Tulsa, Oklahoma, where he builds a new criminal empire with a group of unlikely characters.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/588/1471782.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/588/1471782.jpg",
    "providers": [
      "paramount"
    ],
    "primaryProvider": "paramount",
    "genres": [
      "Crime",
      "Drama",
      "Dark Comedy"
    ],
    "rating": 8,
    "ratingCount": "95K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2022,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 19,
    "runtimeMinutes": 42,
    "creator": "Taylor Sheridan",
    "network": "Paramount+",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNewOnProvider": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "renewed",
    "renewalBadgeText": "Currently Airing • Season 3 Renewed",
    "nextSeasonNumber": 3,
    "renewalNewsSummary": "Sylvester Stallone signed on for Season 3 after record-shattering Season 2 premiere viewership.",
    "cast": [
      {
        "name": "Sylvester Stallone",
        "role": "Dwight \"The General\" Manfredi"
      },
      {
        "name": "Andrea Savage",
        "role": "Stacy Beale"
      },
      {
        "name": "Martin Starr",
        "role": "Bodhi"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 10,
        "releaseDate": "2024-09-15",
        "status": "released"
      }
    ]
  },
  {
    "id": "1883",
    "imdbId": "tt13991232",
    "title": "1883",
    "tagline": "The road west was paved with blood.",
    "synopsis": "Follows the Dutton family as they embark on a journey west through the Great Plains toward the last bastion of untamed America.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/486/1215657.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/486/1215657.jpg",
    "providers": [
      "paramount"
    ],
    "primaryProvider": "paramount",
    "genres": [
      "Western",
      "Drama",
      "Adventure"
    ],
    "rating": 8.7,
    "ratingCount": "120K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2021,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 10,
    "runtimeMinutes": 56,
    "creator": "Taylor Sheridan",
    "network": "Paramount+",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Your Next Watch on Paramount+",
    "cast": [
      {
        "name": "Sam Elliott",
        "role": "Shea Brennan"
      },
      {
        "name": "Tim McGraw",
        "role": "James Dutton"
      },
      {
        "name": "Faith Hill",
        "role": "Margaret Dutton"
      },
      {
        "name": "Isabel May",
        "role": "Elsa Dutton"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Limited Series",
        "episodeCount": 10,
        "releaseDate": "2021-12-19",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-day-of-the-jackal",
    "imdbId": "tt24053860",
    "title": "The Day of the Jackal",
    "tagline": "The ultimate phantom assassin.",
    "synopsis": "An unrivaled, highly elusive assassin makes his living carrying out hits for the highest fee. But after his latest kill, he meets his match in a tenacious British intelligence officer who tracks him in a thrilling cat-and-mouse chase across Europe.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/541/1352923.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/541/1352923.jpg",
    "providers": [
      "peacock"
    ],
    "primaryProvider": "peacock",
    "genres": [
      "Espionage",
      "Thriller",
      "Action",
      "Crime"
    ],
    "rating": 8.2,
    "ratingCount": "35K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2024,
    "decade": "2020s",
    "totalSeasons": 1,
    "totalEpisodes": 10,
    "runtimeMinutes": 52,
    "creator": "Ronan Bennett (Frederick Forsyth Novel)",
    "network": "Sky / Peacock",
    "status": "Returning Series",
    "isNowPlaying": true,
    "isUpcoming": false,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNewOnProvider": true,
    "isCurrentlyAiring": true,
    "renewalState": "renewed",
    "renewalBadgeText": "New on Peacock • Renewed for Season 2",
    "nextSeasonNumber": 2,
    "renewalNewsSummary": "Eddie Redmayne and Lashana Lynch star; officially renewed for Season 2 after record-breaking premiere ratings.",
    "cast": [
      {
        "name": "Eddie Redmayne",
        "role": "The Jackal"
      },
      {
        "name": "Lashana Lynch",
        "role": "Bianca"
      },
      {
        "name": "Úrsula Corberó",
        "role": "Nuria"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 10,
        "releaseDate": "2024-11-07",
        "status": "released"
      }
    ]
  },
  {
    "id": "poker-face",
    "imdbId": "tt14264670",
    "title": "Poker Face",
    "tagline": "She can tell when you're lying.",
    "synopsis": "Charlie has an extraordinary ability to determine when someone is lying. She hits the road with her Plymouth Barracuda and with every stop encounters a new cast of characters and strange crimes she can't help but solve.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/567/1419482.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/567/1419482.jpg",
    "providers": [
      "peacock"
    ],
    "primaryProvider": "peacock",
    "genres": [
      "Mystery",
      "Comedy-Drama",
      "Crime"
    ],
    "rating": 7.9,
    "ratingCount": "65K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2023,
    "decade": "2020s",
    "totalSeasons": 2,
    "totalEpisodes": 20,
    "runtimeMinutes": 54,
    "creator": "Rian Johnson",
    "network": "Peacock Original",
    "status": "Returning Series",
    "isNowPlaying": false,
    "isUpcoming": true,
    "isClassic": false,
    "hasNewSeasonAlert": true,
    "isNextWatch": true,
    "isCurrentlyAiring": true,
    "renewalState": "in_production",
    "renewalBadgeText": "Season 2 Coming to Peacock",
    "nextSeasonNumber": 2,
    "nextSeasonReleaseDate": "2025-06-12",
    "nextSeasonDaysLeft": 96,
    "renewalNewsSummary": "Rian Johnson and Natasha Lyonne return for Season 2 with another lineup of guest star murder mysteries.",
    "cast": [
      {
        "name": "Natasha Lyonne",
        "role": "Charlie Cale"
      },
      {
        "name": "Benjamin Bratt",
        "role": "Cliff LeGrand"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 10,
        "releaseDate": "2023-01-26",
        "status": "released"
      },
      {
        "seasonNumber": 2,
        "title": "Season 2",
        "episodeCount": 10,
        "releaseDate": "2025-06-12",
        "status": "upcoming",
        "countdownDays": 96
      }
    ]
  },
  {
    "id": "breaking-bad",
    "imdbId": "tt0903747",
    "title": "Breaking Bad",
    "tagline": "All bad things must come to an end.",
    "synopsis": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's financial future.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg",
    "providers": [
      "netflix"
    ],
    "primaryProvider": "netflix",
    "genres": [
      "Crime",
      "Drama",
      "Thriller"
    ],
    "rating": 9.5,
    "ratingCount": "2.1M+",
    "contentRating": "TV-MA",
    "firstAirYear": 2008,
    "decade": "2000s",
    "totalSeasons": 5,
    "totalEpisodes": 62,
    "runtimeMinutes": 47,
    "creator": "Vince Gilligan",
    "network": "AMC / Netflix",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": true,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Television Masterpiece on Netflix",
    "cast": [
      {
        "name": "Bryan Cranston",
        "role": "Walter White"
      },
      {
        "name": "Aaron Paul",
        "role": "Jesse Pinkman"
      },
      {
        "name": "Anna Gunn",
        "role": "Skyler White"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 5,
        "title": "Season 5",
        "episodeCount": 16,
        "releaseDate": "2013-09-29",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-sopranos",
    "imdbId": "tt0141842",
    "title": "The Sopranos",
    "tagline": "Family. Business. Therapy.",
    "synopsis": "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that's affecting his mental state, leading him to seek professional psychiatric counseling.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/4/11341.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/4/11341.jpg",
    "providers": [
      "max"
    ],
    "primaryProvider": "max",
    "genres": [
      "Crime",
      "Drama"
    ],
    "rating": 9.2,
    "ratingCount": "460K+",
    "contentRating": "TV-MA",
    "firstAirYear": 1999,
    "decade": "90s",
    "totalSeasons": 6,
    "totalEpisodes": 86,
    "runtimeMinutes": 55,
    "creator": "David Chase",
    "network": "HBO / Max",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": true,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Golden Age Classic on Max",
    "cast": [
      {
        "name": "James Gandolfini",
        "role": "Tony Soprano"
      },
      {
        "name": "Lorraine Bracco",
        "role": "Dr. Jennifer Melfi"
      },
      {
        "name": "Edie Falco",
        "role": "Carmela Soprano"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 6,
        "title": "Season 6",
        "episodeCount": 21,
        "releaseDate": "2007-06-10",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-wire",
    "imdbId": "tt0306414",
    "title": "The Wire",
    "tagline": "Listen carefully.",
    "synopsis": "The Baltimore drug scene, seen through the eyes of drug dealers and law enforcement, expanding each season to examine schools, politics, and the press.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/504/1260189.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/504/1260189.jpg",
    "providers": [
      "max"
    ],
    "primaryProvider": "max",
    "genres": [
      "Crime",
      "Drama",
      "Thriller"
    ],
    "rating": 9.3,
    "ratingCount": "370K+",
    "contentRating": "TV-MA",
    "firstAirYear": 2002,
    "decade": "2000s",
    "totalSeasons": 5,
    "totalEpisodes": 60,
    "runtimeMinutes": 59,
    "creator": "David Simon",
    "network": "HBO / Max",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": true,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Essential Classic on Max",
    "cast": [
      {
        "name": "Dominic West",
        "role": "Jimmy McNulty"
      },
      {
        "name": "Idris Elba",
        "role": "Stringer Bell"
      },
      {
        "name": "Michael K. Williams",
        "role": "Omar Little"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 5,
        "title": "Season 5",
        "episodeCount": 10,
        "releaseDate": "2008-03-09",
        "status": "released"
      }
    ]
  },
  {
    "id": "twin-peaks",
    "imdbId": "tt0098936",
    "title": "Twin Peaks",
    "tagline": "Who killed Laura Palmer?",
    "synopsis": "An idiosyncratic FBI agent investigates the murder of a young woman in the even more idiosyncratic town of Twin Peaks.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/397/992910.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/397/992910.jpg",
    "providers": [
      "paramount",
      "mubi"
    ],
    "primaryProvider": "paramount",
    "genres": [
      "Mystery",
      "Surrealism",
      "Drama",
      "Horror"
    ],
    "rating": 8.8,
    "ratingCount": "220K+",
    "contentRating": "TV-14",
    "firstAirYear": 1990,
    "decade": "90s",
    "totalSeasons": 3,
    "totalEpisodes": 48,
    "runtimeMinutes": 47,
    "creator": "Mark Frost & David Lynch",
    "network": "Paramount+ / MUBI Retrospective",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": true,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Cult Classic on Paramount+ & MUBI",
    "cast": [
      {
        "name": "Kyle MacLachlan",
        "role": "Special Agent Dale Cooper"
      },
      {
        "name": "Michael Ontkean",
        "role": "Sheriff Harry S. Truman"
      },
      {
        "name": "Mädchen Amick",
        "role": "Shelly Johnson"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 8,
        "releaseDate": "1990-04-08",
        "status": "released"
      }
    ]
  },
  {
    "id": "the-twilight-zone",
    "imdbId": "tt0052520",
    "title": "The Twilight Zone",
    "tagline": "You unlocking this door with the key of imagination.",
    "synopsis": "Ordinary people find themselves in extraordinarily astounding situations, which they each try to solve in a remarkable manner.",
    "posterUrl": "https://static.tvmaze.com/uploads/images/original_untouched/398/996733.jpg",
    "backdropUrl": "https://static.tvmaze.com/uploads/images/original_untouched/398/996733.jpg",
    "providers": [
      "paramount"
    ],
    "primaryProvider": "paramount",
    "genres": [
      "Anthology",
      "Sci-Fi",
      "Fantasy",
      "Horror"
    ],
    "rating": 9.1,
    "ratingCount": "95K+",
    "contentRating": "TV-PG",
    "firstAirYear": 1959,
    "decade": "Pre-70s",
    "totalSeasons": 5,
    "totalEpisodes": 156,
    "runtimeMinutes": 25,
    "creator": "Rod Serling",
    "network": "CBS / Paramount+",
    "status": "Ended",
    "isNowPlaying": false,
    "isUpcoming": false,
    "isClassic": true,
    "hasNewSeasonAlert": false,
    "isNextWatch": true,
    "renewalState": "concluded",
    "renewalBadgeText": "Foundational Classic on Paramount+",
    "cast": [
      {
        "name": "Rod Serling",
        "role": "Narrator / Host"
      }
    ],
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Season 1",
        "episodeCount": 36,
        "releaseDate": "1959-10-02",
        "status": "released"
      }
    ]
  }
];
