-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: autoshkola_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `additional_services`
--

DROP TABLE IF EXISTS `additional_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `additional_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `additional_services`
--

LOCK TABLES `additional_services` WRITE;
/*!40000 ALTER TABLE `additional_services` DISABLE KEYS */;
INSERT INTO `additional_services` VALUES (21,'╨г╤Б╨╗╤Г╨│╨░',600.00,'╨╖╨░ 600',2,1,'2025-09-23 14:30:25','2025-09-23 14:30:25');
/*!40000 ALTER TABLE `additional_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `featured_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int NOT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `tags` json DEFAULT NULL,
  `view_count` int DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_slug` (`slug`),
  FULLTEXT KEY `idx_search` (`title`,`content`,`excerpt`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` VALUES (16,'╨Я╨╛╤Б╤В1','post1','╨Ю╨┐╨╕╤Б╨░╨╜╨╕╨╡ ╨┐╨╛╤Б╤В╨░1','<p>╨п ╨┐╤А╨╕╨▓╨╡╤В</p>','https://images.pexels.com/photos/5301511/pexels-photo-5301511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',3,'published','','','[]',4,'2025-09-23 14:32:38','2025-09-23 14:32:38','2025-09-23 14:38:40');
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `admin_response` text COLLATE utf8mb4_unicode_ci,
  `responded_at` timestamp NULL DEFAULT NULL,
  `responded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `responded_by` (`responded_by`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_email` (`email`),
  CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`responded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (9,'╨Р╤Б╨╝╨╕╤А','asmir@gmail.com','87767288210','cooperation','╨Р╤Б╨╝╨╕╤А ╨Р╤Б╨╝╨╕╤А ╨Р╤Б╨╝╨╕╤А ╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А╨Р╤Б╨╝╨╕╤А',1,NULL,NULL,NULL,'2025-09-23 14:35:54','2025-09-23 14:36:11');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `featured_image` longtext COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `instructor_id` int NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `difficulty` enum('beginner','intermediate','advanced') COLLATE utf8mb4_unicode_ci DEFAULT 'beginner',
  `duration_weeks` int DEFAULT '4',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `prerequisites` text COLLATE utf8mb4_unicode_ci,
  `learning_outcomes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_instructor_id` (`instructor_id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_category` (`category`),
  FULLTEXT KEY `idx_search` (`title`,`description`,`short_description`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (9,'╨║╤Г╤А╤Б ╤В╨╡╤Б╤В╨░','╨║╤Г╤А╤Б-╤В╨╡╤Б╤В╨░','╨┤╨╡╤Б╨║ ╨║╤Г╤А╤Б╨░','╨в╨╡╤Б╤В╨╛╨▓╤Л╨╣ ╨║╤Г╤А╤Б ╨┤╨╡╤Б╨║','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAflBMVEX///8AAAD7+/vw8PDKysrX19fS0tKnp6e2trbNzc35+fmwsLDs7OzFxcWhoaHz8/NMTEwbGxtDQ0OPj499fX2Ghobk5OSXl5dwcHDm5ubd3d28vLw+Pj4zMzNbW1stLS06OjohISFmZmYPDw8WFhZhYWFVVVVtbW2Kiop3d3eJlLnyAAAF/0lEQVR4nO2c6YKiOhCFoUFQVMAVxQWV1m7f/wVH7x2SSghIWlmmPd9PSGU5ZE8FwwAAAAAAAAAAAAAAAAAAAAAAAADAf3wAGcMFMqgnedpuugAAAAAAAAAAAAAAAPA22EDG6AEZw6pK8IBnbEuNG8foVyUsZboos43KjffDyrlogqpnXoZhlhOVxGRsym2Po04dvVXvjMdDf75VF2kfuf1lme3Itt3FXmX7eZoNx4N/++htPJcKtXOtysabqWR8GtSY1QYZCqUKRzq2H2Jd8evKY+OcaLFiPVsrobWknvy1QUyKtdc19rntRFPPLjPa8XINdY2JoNM6MtcSH2deLu0+0uK2lzoy1xZ86El7urbWhBmv6shbW3yzYiWlsxIVAW948zry1hYzVqzdWtc24NO+7zry1hYRK9ZWa3ZyJ+DTtlkdeWsLPp5Oq89h/+KF0EQGmuSBJnmgSR5okgea5IEmeaBJnt+qics1CXRtP/4FTYba9FesWImra+zyNeC5X9nKL0KRfmHYyqkZI20sst6JdY2XfL2zCCobmRM16TUXR5B8FoStnMefVK3G+xPPLEKx3zApCqubVS2a72ODIHCuQgHTWe9+puopw1rjuaBMutp4gXbXp0VL445LSnlwHgTu0aOkBk6R2hqLuSgTRf2Q6HFJNroJ/YC2NBmxw6FFhdC7n2fyB7SlSXDJTN0KodmMoZGjtdbmsV+ZaZVjJTZjaOR8gGiy9gLvRnX/hKc0YUNPv0Jg1vtctdP5AVyT9LDdTsPL/ny6LqLIdzeDRxv5T2nCDpaq9Jp9nc7naciZr4JktekVV5v31OTOxS+aIL+vJje+1UeEv1+T42I4iIO1s3G/vy5HUZRU6XHz+zWh+yfesi+5Zq0UI/UbaCKVOuZHyXeSvCjvp8lNFV7mG2Hu/TtqYhgLofnIb99TE2FNb0bSyzfVhPhimDnHyHfVxKN9yrXw3ROajCsE7pYmgreoVFFeo4nvDO44Ti+Oi/YUO6aJQR3QxW3k12jCSCdJeFoM14p9t65pQu9hbIUP+WJNMpKrK9eXrmkyIi7kqbCdXJMmNyaRuO7smiYG7WWFQeJl/Ykz7rsLcY2VCCl1ThPiai1OUV497qyH9KoHdS/tnCb0gErIUw1j8YY0VBJn5zSha8Ev+qKO+cmaXIqw2dNOayIMxrXMY0mkCetoO6cJd8eQbnPVM7cnh35sS79zmtCOr4ZxJ7feObJYw+xR5zShO25C469JE7IWzx51TZMl/27SfZaaNBnw9LJpftc06fMsmmfhTU2axPwjZNesuqYJ7U7E8+6a9grWfI6SjcYd04QMA6YprkK8Z+7vVKonWVNtVhO+j6bWRLhZLW0+kjtN+nktriekP8keNasJvw+o1oTeVE+lnY3gwF7p3wcsrif8MyXZo2Y14TvzSk3IN8tfvw94w/9S2JbDVlE5TVIWK+u+mtWET1JVmgiSfMkeBhbPfZi3fQDzyZE14dWEX25nvV4T91MtPnQoNBnyQpvmIbdZSu5cH3QT5r5bkibkM/BKwWpzE35K9Hq9rIknerHmfQvIkPSpe2GbD7jSupg7w05598UEbMKfjbhaSJqMxOPineInDXRxWMVTj8L1FDQhXXpI6mXxh3s9oyPPwzZmnswf1nhF9jFu7BV+OWMaINH8PQ5XfJil6gXjC4/wTEpPUrKVsb2QWPx/0DGcRzcW17MpclT54Un/VTo9dv0lLElPtVtFke9Hsz31IZ8Rjck/AMieyqux1sue7dN/upRwkbw1rWAUO/4uF853RkFgPXSFt4K1Xbppf3cP+ltyaxk7dvQpvJw5y3UdLWi7S9KC/Aikx+killrFYDs9HNXBD+F0en4gircL83IKSZ7GrC6EiepmRrLbVi9q1Z/bxYqEcnmbJJdrZC+XcSzaPvCA+7TjglT/Nx+U2E4O5/ktSZbisjBkaRrCf/zGr8Ue2C+OsfkkdVoPAAAAAAAAAAAAAAAAAABqxgEyxgDItF1NAQAAAAAAAAAAAAAAAABAsICM0Qcyhgdk2m66AADwm/kDAiPJsKj2HLAAAAAASUVORK5CYII=',18.00,30,'practice','intermediate',3,1,'2025-09-23 14:20:48','2025-09-23 14:20:48','','');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discounts`
--

DROP TABLE IF EXISTS `discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `conditions` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discounts`
--

LOCK TABLES `discounts` WRITE;
/*!40000 ALTER TABLE `discounts` DISABLE KEYS */;
INSERT INTO `discounts` VALUES (5,'╨б╤В╤Г╨┤╨╡╨╜╤З╨╡╤Б╨║╨░╤П ╤Б╨║╨╕╨┤╨║╨░','10%','╨б╨║╨╕╨┤╨║╨░ ╨┤╨╗╤П ╨▓╤Б╨╡╤Е ╤Б╤В╤Г╨┤╨╡╨╜╤В╨╛╨▓ ╨▓╤Л╤Б╤И╨╕╤Е ╨╕ ╤Б╤А╨╡╨┤╨╜╨╕╤Е ╤Г╤З╨╡╨▒╨╜╤Л╤Е ╨╖╨░╨▓╨╡╨┤╨╡╨╜╨╕╨╣ ╨╜╨░ ╨╗╤О╨▒╨╛╨╣ ╨║╤Г╤А╤Б ╨╛╨▒╤Г╤З╨╡╨╜╨╕╤П.','╨Э╨╡╨╛╨▒╤Е╨╛╨┤╨╕╨╝╨╛ ╨┐╤А╨╡╨┤╤К╤П╨▓╨╕╤В╤М ╨┤╨╡╨╣╤Б╤В╨▓╤Г╤О╤Й╨╕╨╣ ╤Б╤В╤Г╨┤╨╡╨╜╤З╨╡╤Б╨║╨╕╨╣ ╨▒╨╕╨╗╨╡╤В ╨┐╤А╨╕ ╨╖╨░╨║╨╗╤О╤З╨╡╨╜╨╕╨╕ ╨┤╨╛╨│╨╛╨▓╨╛╤А╨░.',0,1,'2025-09-05 22:28:35','2025-09-05 22:28:35'),(6,'╨б╨╡╨╝╨╡╨╣╨╜╨░╤П ╤Б╨║╨╕╨┤╨║╨░','15%','╨б╨║╨╕╨┤╨║╨░ ╨┤╨╗╤П ╤З╨╗╨╡╨╜╨╛╨▓ ╤Б╨╡╨╝╤М╨╕, ╨║╨╛╤В╨╛╤А╤Л╨╡ ╨╖╨░╨┐╨╕╤Б╤Л╨▓╨░╤О╤В╤Б╤П ╨╜╨░ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╨╡ ╨▓╨╝╨╡╤Б╤В╨╡ ╨╕╨╗╨╕ ╨▓ ╤В╨╡╤З╨╡╨╜╨╕╨╡ 6 ╨╝╨╡╤Б╤П╤Ж╨╡╨▓ ╨┐╨╛╤Б╨╗╨╡ ╤А╨╛╨┤╤Б╤В╨▓╨╡╨╜╨╜╨╕╨║╨░.','╨Э╨╡╨╛╨▒╤Е╨╛╨┤╨╕╨╝╨╛ ╨┐╨╛╨┤╤В╨▓╨╡╤А╨╢╨┤╨╡╨╜╨╕╨╡ ╤А╨╛╨┤╤Б╤В╨▓╨░. ╨б╨║╨╕╨┤╨║╨░ ╤А╨░╤Б╨┐╤А╨╛╤Б╤В╤А╨░╨╜╤П╨╡╤В╤Б╤П ╨╜╨░ ╨▓╤В╨╛╤А╨╛╨│╨╛ ╨╕ ╨┐╨╛╤Б╨╗╨╡╨┤╤Г╤О╤Й╨╕╤Е ╤З╨╗╨╡╨╜╨╛╨▓ ╤Б╨╡╨╝╤М╨╕.',0,1,'2025-09-05 22:28:35','2025-09-05 22:28:35'),(7,'╨Ъ╨╛╤А╨┐╨╛╤А╨░╤В╨╕╨▓╨╜╨░╤П ╤Б╨║╨╕╨┤╨║╨░','╨┤╨╛ 20%','╨б╨║╨╕╨┤╨║╨░ ╨┤╨╗╤П ╤Б╨╛╤В╤А╤Г╨┤╨╜╨╕╨║╨╛╨▓ ╨║╨╛╨╝╨┐╨░╨╜╨╕╨╣-╨┐╨░╤А╤В╨╜╨╡╤А╨╛╨▓ ╨╕╨╗╨╕ ╨┐╤А╨╕ ╨│╤А╤Г╨┐╨┐╨╛╨▓╨╛╨╝ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╨╕ ╨╛╤В 3-╤Е ╤З╨╡╨╗╨╛╨▓╨╡╨║ ╤Б ╨╛╨┤╨╜╨╛╨│╨╛ ╨┐╤А╨╡╨┤╨┐╤А╨╕╤П╤В╨╕╤П.','╨а╨░╨╖╨╝╨╡╤А ╤Б╨║╨╕╨┤╨║╨╕ ╨╖╨░╨▓╨╕╤Б╨╕╤В ╨╛╤В ╨║╨╛╨╗╨╕╤З╨╡╤Б╤В╨▓╨░ ╤З╨╡╨╗╨╛╨▓╨╡╨║ ╨▓ ╨│╤А╤Г╨┐╨┐╨╡. ╨Э╨╡╨╛╨▒╤Е╨╛╨┤╨╕╨╝╨╛ ╨┐╨╛╨┤╤В╨▓╨╡╤А╨╢╨┤╨╡╨╜╨╕╨╡ ╨╛╤В ╤А╨░╨▒╨╛╤В╨╛╨┤╨░╤В╨╡╨╗╤П.',0,1,'2025-09-05 22:28:35','2025-09-05 22:28:35'),(8,'╨б╨║╨╕╨┤╨║╨░ ╨╜╨░ ╨▓╤В╨╛╤А╤Г╤О ╨║╨░╤В╨╡╨│╨╛╤А╨╕╤О','20%','╨б╨║╨╕╨┤╨║╨░ ╨╜╨░ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╨╡ ╨╜╨░ ╨▓╤В╨╛╤А╤Г╤О ╨╕ ╨┐╨╛╤Б╨╗╨╡╨┤╤Г╤О╤Й╨╕╨╡ ╨║╨░╤В╨╡╨│╨╛╤А╨╕╨╕ ╨┤╨╗╤П ╨▓╤Л╨┐╤Г╤Б╨║╨╜╨╕╨║╨╛╨▓ ╨╜╨░╤И╨╡╨╣ ╨░╨▓╤В╨╛╤И╨║╨╛╨╗╤Л.','╨Ф╨╡╨╣╤Б╤В╨▓╤Г╨╡╤В ╨▓ ╤В╨╡╤З╨╡╨╜╨╕╨╡ 3-╤Е ╨╗╨╡╤В ╨┐╨╛╤Б╨╗╨╡ ╨╛╨║╨╛╨╜╤З╨░╨╜╨╕╤П ╨┐╨╡╤А╨▓╨╛╨│╨╛ ╨║╤Г╤А╤Б╨░ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╤П.',0,1,'2025-09-05 22:28:35','2025-09-05 22:28:35');
/*!40000 ALTER TABLE `discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_students`
--

DROP TABLE IF EXISTS `group_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `student_id` int NOT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','completed','dropped') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_group_student` (`group_id`,`student_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `group_students_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_students`
--

LOCK TABLES `group_students` WRITE;
/*!40000 ALTER TABLE `group_students` DISABLE KEYS */;
INSERT INTO `group_students` VALUES (9,9,31,'2025-09-23 14:21:57','active','2025-09-23 14:21:57','2025-09-23 14:21:57');
/*!40000 ALTER TABLE `group_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `course_id` int DEFAULT NULL,
  `instructor_id` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `max_students` int DEFAULT '20',
  `status` enum('active','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_instructor_id` (`instructor_id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  CONSTRAINT `fk_groups_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `groups_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (9,'╨У╤А╤Г╨┐╨┐╨░ ╤В╨╡╤Б╤В','╤В╨╡╤Б╤В ╤В╨╡╤Б╤В',9,30,'2025-09-24','2025-09-25',10,'active','2025-09-23 14:21:11','2025-09-23 14:21:11');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individual_lessons`
--

DROP TABLE IF EXISTS `individual_lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `individual_lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `instructor_id` int NOT NULL,
  `lesson_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `lesson_type` enum('theory','practice','exam') COLLATE utf8mb4_unicode_ci DEFAULT 'practice',
  `status` enum('scheduled','completed','cancelled','missed') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_instructor_id` (`instructor_id`),
  KEY `idx_lesson_date` (`lesson_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `individual_lessons_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `individual_lessons_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_lessons`
--

LOCK TABLES `individual_lessons` WRITE;
/*!40000 ALTER TABLE `individual_lessons` DISABLE KEYS */;
INSERT INTO `individual_lessons` VALUES (13,31,30,'2025-09-19','11:11:00','12:12:00','practice','scheduled',NULL,'2025-09-23 14:23:19','2025-09-23 14:23:19','╨║╨░╨▒╨╕╨╜╨╡╤В 2','╨┐╨┤╨┤','╨Ш╨╜╨┤╨╕╨▓╨╕╨┤╤Г╨░╨╗╤М╨╜╨╛╨╡ ╨╖╨░╨╜╤П╤В╨╕╨╡ - ╨┐╨┤╨┤',''),(14,31,30,'2025-09-27','21:23:00','22:23:00','practice','scheduled',NULL,'2025-09-23 14:25:00','2025-09-23 14:25:00','╨╛╨║╨╛╨╗╨╛','╨Ц╨╡╨┐╨░','╨Ш╨╜╨┤╨╕╨▓','╨Ш╨╜╨┤╨╕╨▓ ╤В╨╡╤Б╤В'),(15,31,30,'2025-09-26','23:00:00','23:23:00','practice','scheduled',NULL,'2025-09-23 14:28:33','2025-09-23 14:28:33','╤Б╨┐╨╛╤А╤В╨╖╨░╨╗','╤Д╨╕╨╖╤А╨░','╨Ш╨╜╨┤╨╕╨▓╨╕╨┤╤Г╨░╨╗╤М╨╜╨╛╨╡ ╨╖╨░╨╜╤П╤В╨╕╨╡ - ╤Д╨╕╨╖╤А╨░','╨╖╨░╨╝╨╡╤В╨║╨╕');
/*!40000 ALTER TABLE `individual_lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_profiles`
--

DROP TABLE IF EXISTS `instructor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `categories` json DEFAULT NULL,
  `experience` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci,
  `schedule` text COLLATE utf8mb4_unicode_ci,
  `rating` decimal(3,2) DEFAULT '0.00',
  `reviews_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `instructor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_profiles`
--

LOCK TABLES `instructor_profiles` WRITE;
/*!40000 ALTER TABLE `instructor_profiles` DISABLE KEYS */;
INSERT INTO `instructor_profiles` VALUES (5,30,'[]','1','╨Ъ╨╡╨║ ╨╗╨╛╨╗ ','╨┐╨╜ 900-1800',0.00,0,'2025-09-23 14:17:46','2025-09-23 14:17:46');
/*!40000 ALTER TABLE `instructor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_ratings`
--

DROP TABLE IF EXISTS `instructor_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `instructor_id` int NOT NULL,
  `rating` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_instructor_rating` (`user_id`,`instructor_id`),
  KEY `idx_instructor_id` (`instructor_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `instructor_ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instructor_ratings_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instructor_ratings_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_ratings`
--

LOCK TABLES `instructor_ratings` WRITE;
/*!40000 ALTER TABLE `instructor_ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `instructor_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `course_id` int NOT NULL,
  `status` enum('not_started','in_progress','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'not_started',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `time_spent` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lesson` (`student_id`,`lesson_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_lesson_id` (`lesson_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_progress_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_progress`
--

LOCK TABLES `lesson_progress` WRITE;
/*!40000 ALTER TABLE `lesson_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_tests`
--

DROP TABLE IF EXISTS `lesson_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `passing_score` int DEFAULT '70',
  `time_limit` int DEFAULT '0',
  `max_attempts` int DEFAULT '3',
  `questions` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lesson_id` (`lesson_id`),
  CONSTRAINT `lesson_tests_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_tests`
--

LOCK TABLES `lesson_tests` WRITE;
/*!40000 ALTER TABLE `lesson_tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `lesson_type` enum('video','text','live_stream','test') COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_duration` int DEFAULT '0',
  `live_stream_date` timestamp NULL DEFAULT NULL,
  `live_stream_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `is_preview` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_order_index` (`order_index`),
  KEY `idx_lesson_type` (`lesson_type`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `success` tinyint(1) NOT NULL,
  `attempted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_attempted_at` (`attempted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
INSERT INTO `login_attempts` VALUES (1,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 09:41:07'),(2,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 09:41:33'),(3,'m.tairxan@mail.ru','::ffff:127.0.0.1',1,'2025-09-01 09:46:12'),(4,'m.tairxan@mail.ru','::ffff:127.0.0.1',1,'2025-09-01 09:46:35'),(5,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 10:28:25'),(6,'m.tairxan@mail.ru','::ffff:127.0.0.1',1,'2025-09-01 10:31:03'),(7,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 11:49:30'),(8,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-01 11:50:33'),(9,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-01 11:56:48'),(10,'m.tairxan@mail.ru','::ffff:127.0.0.1',0,'2025-09-01 12:01:03'),(11,'m.tairxan@mail.ru','::ffff:127.0.0.1',1,'2025-09-01 12:01:13'),(12,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-01 12:01:27'),(13,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 12:17:44'),(14,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 12:34:25'),(15,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 12:35:58'),(16,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-01 12:36:28'),(17,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-01 12:37:22'),(18,'m.tairxan@mail.ru','::ffff:127.0.0.1',1,'2025-09-01 12:37:57'),(19,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 12:38:16'),(20,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-01 12:38:50'),(21,'asdasd@gmail.com','::ffff:127.0.0.1',1,'2025-09-02 07:54:33'),(22,'asdasd@gmail.com','::ffff:127.0.0.1',1,'2025-09-02 07:54:49'),(23,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-02 08:06:42'),(24,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-02 08:23:42'),(25,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-02 14:12:37'),(26,'admin@autoshkola.ru','::1',1,'2025-09-02 14:17:38'),(27,'admin@autoshkola.ru','::1',1,'2025-09-02 14:17:44'),(28,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-02 14:26:59'),(29,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-02 16:11:51'),(30,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-03 08:34:18'),(31,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-03 08:52:25'),(32,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-03 09:04:58'),(33,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-03 09:11:44'),(34,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-03 10:29:32'),(35,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-03 14:20:27'),(36,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-03 14:20:36'),(37,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-04 07:09:23'),(38,'alkawmaga@gmail.com','::ffff:127.0.0.1',0,'2025-09-04 08:44:33'),(39,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-04 08:44:38'),(40,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-04 08:44:56'),(41,'admin@autoshkola.ru','::1',1,'2025-09-04 08:55:41'),(42,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-04 09:16:43'),(43,'alkawmaga@gmail.com','::1',1,'2025-09-04 09:18:52'),(44,'asmir@asmir.ru','::ffff:127.0.0.1',1,'2025-09-04 10:43:25'),(45,'asmir@asmir.ru','::ffff:127.0.0.1',1,'2025-09-04 10:43:40'),(46,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-05 08:40:03'),(47,'admin@autoshkola.ru','::1',1,'2025-09-05 08:40:25'),(48,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-05 08:40:32'),(49,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-05 17:18:17'),(50,'admin@autoshkola.ru','::1',1,'2025-09-05 18:30:46'),(51,'admin@autoshkola.ru','::1',1,'2025-09-05 18:35:32'),(52,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-05 19:02:08'),(53,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-05 19:30:41'),(54,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-05 19:31:05'),(55,'admin@autoshkola.ru','::1',1,'2025-09-05 19:44:57'),(56,'admin@autoshkola.ru','::1',1,'2025-09-05 19:49:37'),(57,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-05 20:01:23'),(58,'admin@autoshkola.ru','::1',1,'2025-09-05 20:16:28'),(59,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-05 21:09:33'),(60,'admin@autoshkola.ru','::1',1,'2025-09-05 21:43:55'),(61,'admin@autoshkola.ru','::1',1,'2025-09-05 22:00:03'),(62,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-09 07:13:31'),(63,'alkawmaga@gmail.com','::ffff:127.0.0.1',1,'2025-09-09 10:56:34'),(64,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-09 10:59:39'),(65,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-09 14:42:21'),(66,'admin@autoshkola.ru','::ffff:127.0.0.1',1,'2025-09-10 12:37:33'),(67,'admin@autoshkola.ru','192.168.8.16',1,'2025-09-10 13:09:39'),(68,'vladik@gmail.com','192.168.8.26',1,'2025-09-10 13:19:47'),(69,'ivanzolo2001@gmail.com','192.168.8.12',1,'2025-09-10 13:22:00'),(70,'ivanzolo2001@gmail.com','192.168.8.12',1,'2025-09-10 13:22:06'),(71,'alkawmaga@gmail.com','192.168.8.16',1,'2025-09-10 13:25:09'),(72,'admin@autoshkola.ru','192.168.8.16',1,'2025-09-10 13:25:40'),(73,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-10 13:41:32'),(74,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-10 15:47:51'),(75,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-10 16:59:13'),(76,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-11 08:39:32'),(77,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-11 08:41:44'),(78,'student@autoshkola.ru','192.168.8.17',1,'2025-09-11 08:42:46'),(79,'student@autoshkola.ru','192.168.8.17',1,'2025-09-11 08:51:31'),(80,'student@autoshkola.ru','192.168.8.17',1,'2025-09-11 09:07:58'),(81,'student@autoshkola.ru','192.168.8.17',1,'2025-09-11 09:08:00'),(82,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-11 09:08:28'),(83,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-11 09:15:20'),(84,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-11 09:16:44'),(85,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-12 11:39:41'),(86,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-12 11:42:50'),(87,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-12 12:38:08'),(88,'asdjkhasjk@asdkljwqod.com','192.168.8.17',1,'2025-09-22 16:11:23'),(89,'asjkdh@asdjlkh.com','192.168.8.17',1,'2025-09-22 16:12:30'),(90,'admin@autoshkola.russs','192.168.8.17',1,'2025-09-22 16:13:39'),(91,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-22 16:13:53'),(92,'alkawmaga@gmail.com','192.168.8.17',0,'2025-09-22 16:14:10'),(93,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-22 16:14:15'),(94,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-22 17:00:35'),(95,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-22 17:06:59'),(96,'student@autoshkola.ru','192.168.8.17',0,'2025-09-22 17:30:13'),(97,'student@autoshkola.ru','192.168.8.17',0,'2025-09-22 17:30:17'),(98,'student@autoshkola.ru','192.168.8.17',1,'2025-09-22 17:30:55'),(99,'alkawmaga@gmail.com','192.168.8.17',0,'2025-09-22 17:34:53'),(100,'alkawmaga@gmail.com','192.168.8.17',0,'2025-09-22 17:35:07'),(101,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-22 17:35:10'),(102,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-22 18:06:12'),(103,'student@avtoshkola.ru','192.168.8.17',0,'2025-09-22 18:19:46'),(104,'student@autoshkola.ru','192.168.8.17',1,'2025-09-22 18:19:51'),(105,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-22 20:02:55'),(106,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-22 20:07:41'),(107,'student@autoshkola.ru','192.168.8.17',1,'2025-09-22 20:08:13'),(108,'student@autoshkola.ru','192.168.8.17',1,'2025-09-22 20:13:41'),(109,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-22 23:57:32'),(110,'zalupa@mail.ru','192.168.8.16',1,'2025-09-22 23:58:07'),(111,'zalupa@mail.ru','192.168.8.16',1,'2025-09-23 00:01:00'),(112,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-23 00:34:07'),(113,'student@autoshkola.ru','192.168.8.17',0,'2025-09-23 00:43:58'),(114,'student@autoshkola.ru','192.168.8.17',1,'2025-09-23 00:44:09'),(115,'student@autoshkola.ru','127.0.0.1',1,'2025-09-23 01:26:43'),(116,'student@autoshkola.ru','127.0.0.1',1,'2025-09-23 01:39:09'),(117,'student@autoshkola.ru','127.0.0.1',1,'2025-09-23 01:39:55'),(118,'student@autoshkola.ru','192.168.8.17',1,'2025-09-23 01:40:09'),(119,'peppa@gmail.com','192.168.8.16',1,'2025-09-23 12:03:29'),(120,'zalupa@mail.ru','192.168.8.16',0,'2025-09-23 12:07:07'),(121,'zalupa@mail.ru','192.168.8.16',0,'2025-09-23 12:07:13'),(122,'zalupa@gmail.com','192.168.8.16',0,'2025-09-23 12:07:16'),(123,'zalupa@mail.ru','192.168.8.16',1,'2025-09-23 12:07:30'),(124,'peppa@gmail.com','192.168.8.16',1,'2025-09-23 12:08:06'),(125,'zalupa@mail.ru','192.168.8.16',1,'2025-09-23 12:23:51'),(126,'alkawmaga@gmail.com','192.168.8.17',1,'2025-09-23 12:32:16'),(127,'peppa@gmail.com','192.168.8.16',1,'2025-09-23 12:34:00'),(128,'peppa@gmail.com','192.168.8.16',1,'2025-09-23 12:41:04'),(129,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-23 12:42:38'),(130,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-23 13:22:11'),(131,'student@autoshkola.ru','192.168.8.17',1,'2025-09-23 13:22:26'),(132,'admin@autoshkola.ru','192.168.8.16',1,'2025-09-23 13:22:45'),(133,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-23 13:42:13'),(134,'ayaru@mail.ru','192.168.8.21',1,'2025-09-23 14:18:21'),(135,'asmir@gmail.com','192.168.8.15',1,'2025-09-23 14:19:23'),(136,'admin@autoshkola.ru','192.168.8.17',1,'2025-09-23 14:51:15'),(137,'asmir@gmail.com','192.168.8.17',1,'2025-09-23 14:54:21');
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_categories`
--

DROP TABLE IF EXISTS `price_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `description` text,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_categories`
--

LOCK TABLES `price_categories` WRITE;
/*!40000 ALTER TABLE `price_categories` DISABLE KEYS */;
INSERT INTO `price_categories` VALUES (10,'╨╜╨░╨╖╨▓╨░╨╜╨╕╨╡ ╨░╨╣╨┤╨╕','FaMotorcycle','╨Ь╨╛╤В╨╛╤Ж╨╕╨║╨╗╨╡',1,1,'2025-09-23 14:29:13','2025-09-23 14:29:13');
/*!40000 ALTER TABLE `price_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_discounts`
--

DROP TABLE IF EXISTS `price_discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_discounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `discount_value` decimal(5,2) NOT NULL,
  `description` text,
  `conditions` text,
  `is_active` tinyint(1) DEFAULT '1',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_discounts`
--

LOCK TABLES `price_discounts` WRITE;
/*!40000 ALTER TABLE `price_discounts` DISABLE KEYS */;
INSERT INTO `price_discounts` VALUES (5,'╤Б╨║╨╕╨┤╨╛╨╜',5.00,'5%%%','╨┐╨╛╨╗╤Г╤З╨░╨╣',1,'2025-09-27','2025-09-30',1,'2025-09-23 14:30:47','2025-09-23 14:30:47');
/*!40000 ALTER TABLE `price_discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_plans`
--

DROP TABLE IF EXISTS `price_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `lessons_count` int DEFAULT NULL,
  `description` text,
  `features` json DEFAULT NULL,
  `is_popular` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `price_plans_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `price_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_plans`
--

LOCK TABLES `price_plans` WRITE;
/*!40000 ALTER TABLE `price_plans` DISABLE KEYS */;
INSERT INTO `price_plans` VALUES (11,10,'╨Э╨░╨╖╨▓╨░╨╜╨╕╨╡ ╨┐╨╗╨░╨╜╨░',1111.00,2.00,'7',7,'╤Л╨▓╤Л╨▓','\"╨ж╨╡╨╜╨╜╨╕╨║\\n╨ж╨╡╨╜╨╜╨╕╨║2\\n3\\n4\"',1,1,1,'2025-09-23 14:30:12','2025-09-23 14:30:12');
/*!40000 ALTER TABLE `price_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_settings`
--

DROP TABLE IF EXISTS `price_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_settings`
--

LOCK TABLES `price_settings` WRITE;
/*!40000 ALTER TABLE `price_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `price_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_likes`
--

DROP TABLE IF EXISTS `review_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `review_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review_like` (`user_id`,`review_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_review_id` (`review_id`),
  CONSTRAINT `review_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_likes_ibfk_2` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_likes`
--

LOCK TABLES `review_likes` WRITE;
/*!40000 ALTER TABLE `review_likes` DISABLE KEYS */;
INSERT INTO `review_likes` VALUES (6,3,13,'2025-09-23 14:36:58'),(8,30,13,'2025-09-23 14:40:22');
/*!40000 ALTER TABLE `review_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '0',
  `likes_count` int DEFAULT '0',
  `replies_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_is_approved` (`is_approved`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (13,31,NULL,'schedule','undefined undefined','asmir@gmail.com',NULL,1,'╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ╨Ъ╨╗╨░╤Б╤Б╨╜╨╛ ',1,1,2,0,'2025-09-23 14:36:46','2025-09-23 14:40:22'),(14,3,NULL,'instructor','undefined undefined','admin@autoshkola.ru',NULL,5,'asdasddasdasdas',1,1,0,0,'2025-09-23 15:08:28','2025-09-23 15:08:34');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `lesson_type` enum('theory','practice','exam') COLLATE utf8mb4_unicode_ci DEFAULT 'theory',
  `classroom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `is_one_time` tinyint(1) DEFAULT '0',
  `scheduled_date` date DEFAULT NULL,
  `instructor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_day_of_week` (`day_of_week`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_is_active` (`is_active`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (11,9,'wednesday','23:20:00','00:20:00','theory',NULL,'╨│╤А╤Г╨┐╨╛╨▓╨╛╨╡',1,'2025-09-23 14:21:49','2025-09-23 14:21:49','╨┤╨╛╨┤╨╡╨┐','╨┤╨╡╨┐',1,'2025-09-24',30),(12,9,'friday','11:11:00','12:12:00','theory',NULL,'╨┤╨╛╨┐ ╨╕╨╜╤Д╨╛╤А╨╝╨░╤Ж╨╕╤П',1,'2025-09-23 14:27:14','2025-09-23 14:27:14','╤Г╨╗╨╕╤Ж╨░ ','╨│╤А╤Г╨┐╨┐╨░ ╨┐╨┤╨┤',1,'2025-12-12',30);
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_courses`
--

DROP TABLE IF EXISTS `student_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `assigned_by` int NOT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `progress_percentage` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completion_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_course` (`student_id`,`course_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_assigned_by` (`assigned_by`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `student_courses_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_courses_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_courses`
--

LOCK TABLES `student_courses` WRITE;
/*!40000 ALTER TABLE `student_courses` DISABLE KEYS */;
INSERT INTO `student_courses` VALUES (16,31,9,3,'2025-09-23 14:21:54',NULL,NULL,0.00,1,'2025-09-23 14:21:54',NULL);
/*!40000 ALTER TABLE `student_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_lesson_progress`
--

DROP TABLE IF EXISTS `student_lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_lesson_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lesson_progress` (`student_id`,`lesson_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_lesson_id` (`lesson_id`),
  KEY `idx_is_completed` (`is_completed`),
  CONSTRAINT `student_lesson_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_lesson_progress`
--

LOCK TABLES `student_lesson_progress` WRITE;
/*!40000 ALTER TABLE `student_lesson_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_lesson_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,'╨Р╨╗╨╡╨║╤Б╨░╨╜╨┤╤А ╨Я╨╡╤В╤А╨╛╨▓','╨Ф╨╕╤А╨╡╨║╤В╨╛╤А ╨░╨▓╤В╨╛╤И╨║╨╛╨╗╤Л','/images/team/director.jpg','15 ╨╗╨╡╤В','╨Ю╤Б╨╜╨╛╨▓╨░╤В╨╡╨╗╤М ╨░╨▓╤В╨╛╤И╨║╨╛╨╗╤Л ╤Б ╨╝╨╜╨╛╨│╨╛╨╗╨╡╤В╨╜╨╕╨╝ ╨╛╨┐╤Л╤В╨╛╨╝ ╨┐╤А╨╡╨┐╨╛╨┤╨░╨▓╨░╨╜╨╕╤П ╨╕ ╤Г╨┐╤А╨░╨▓╨╗╨╡╨╜╨╕╤П. ╨Ь╨░╤Б╤В╨╡╤А ╤Б╨┐╨╛╤А╤В╨░ ╨┐╨╛ ╨░╨▓╤В╨╛╨│╨╛╨╜╨║╨░╨╝.',1,1,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(2,'╨Х╨╗╨╡╨╜╨░ ╨б╨╝╨╕╤А╨╜╨╛╨▓╨░','╨а╤Г╨║╨╛╨▓╨╛╨┤╨╕╤В╨╡╨╗╤М ╤Г╤З╨╡╨▒╨╜╨╛╨╣ ╤З╨░╤Б╤В╨╕','/images/team/education-head.jpg','12 ╨╗╨╡╤В','╨Ю╤В╨▓╨╡╤В╤Б╤В╨▓╨╡╨╜╨╜╨░ ╨╖╨░ ╨╛╤А╨│╨░╨╜╨╕╨╖╨░╤Ж╨╕╤О ╤Г╤З╨╡╨▒╨╜╨╛╨│╨╛ ╨┐╤А╨╛╤Ж╨╡╤Б╤Б╨░, ╤Б╨╛╤Б╤В╨░╨▓╨╗╨╡╨╜╨╕╨╡ ╤А╨░╤Б╨┐╨╕╤Б╨░╨╜╨╕╤П ╨╕ ╨║╨╛╨╜╤В╤А╨╛╨╗╤М ╨║╨░╤З╨╡╤Б╤В╨▓╨░ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╤П.',1,2,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(3,'╨Ф╨╝╨╕╤В╤А╨╕╨╣ ╨Ш╨▓╨░╨╜╨╛╨▓','╨б╤В╨░╤А╤И╨╕╨╣ ╨╕╨╜╤Б╤В╤А╤Г╨║╤В╨╛╤А','/images/team/senior-instructor.jpg','10 ╨╗╨╡╤В','╨Т╨╡╨┤╤Г╤Й╨╕╨╣ ╨╕╨╜╤Б╤В╤А╤Г╨║╤В╨╛╤А ╨┐╨╛ ╨┐╤А╨░╨║╤В╨╕╤З╨╡╤Б╨║╨╛╨╝╤Г ╨▓╨╛╨╢╨┤╨╡╨╜╨╕╤О. ╨б╨┐╨╡╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╤Г╨╡╤В╤Б╤П ╨╜╨░ ╨┐╨╛╨┤╨│╨╛╤В╨╛╨▓╨║╨╡ ╨║ ╤Б╨╗╨╛╨╢╨╜╤Л╨╝ ╤Н╨╗╨╡╨╝╨╡╨╜╤В╨░╨╝ ╤Н╨║╨╖╨░╨╝╨╡╨╜╨░.',1,3,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(4,'╨Ю╨╗╤М╨│╨░ ╨Ъ╨╛╨╖╨╗╨╛╨▓╨░','╨Я╤А╨╡╨┐╨╛╨┤╨░╨▓╨░╤В╨╡╨╗╤М ╤В╨╡╨╛╤А╨╕╨╕','/images/team/theory-teacher.jpg','8 ╨╗╨╡╤В','╨Я╤А╨╡╨┐╨╛╨┤╨░╨▓╨░╤В╨╡╨╗╤М ╤В╨╡╨╛╤А╨╡╤В╨╕╤З╨╡╤Б╨║╨╛╨╣ ╤З╨░╤Б╤В╨╕ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╤П. ╨Р╨▓╤В╨╛╤А ╤Г╤З╨╡╨▒╨╜╤Л╤Е ╨┐╨╛╤Б╨╛╨▒╨╕╨╣ ╨┐╨╛ ╨Я╨Ф╨Ф ╨╕ ╨╛╤Б╨╜╨╛╨▓╨░╨╝ ╨▒╨╡╨╖╨╛╨┐╨░╤Б╨╜╨╛╨│╨╛ ╨▓╨╛╨╢╨┤╨╡╨╜╨╕╤П.',1,4,'2025-09-10 16:47:21','2025-09-10 16:47:21');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_attempts`
--

DROP TABLE IF EXISTS `test_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `test_id` int NOT NULL,
  `answers` json NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `passed` tinyint(1) NOT NULL,
  `attempt_number` int NOT NULL DEFAULT '1',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `time_taken` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_lesson_id` (`lesson_id`),
  KEY `idx_test_id` (`test_id`),
  KEY `idx_passed` (`passed`),
  CONSTRAINT `test_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_attempts_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_attempts_ibfk_3` FOREIGN KEY (`test_id`) REFERENCES `lesson_tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_attempts`
--

LOCK TABLES `test_attempts` WRITE;
/*!40000 ALTER TABLE `test_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `test_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_date` date NOT NULL,
  `avatar` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int DEFAULT '5',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `testimonials_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'╨Р╨╜╨╜╨░ ╨Ъ.','╨Ъ╤Г╤А╤Б ╨║╨░╤В╨╡╨│╨╛╤А╨╕╨╕ B','2025-03-01','╨Р╨Ъ','╨Ю╤З╨╡╨╜╤М ╨┤╨╛╨▓╨╛╨╗╤М╨╜╨░ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╨╡╨╝! ╨Ш╨╜╤Б╤В╤А╤Г╨║╤В╨╛╤А ╨Р╨╗╨╡╨║╤Б╨░╨╜╨┤╤А ╨Я╨╡╤В╤А╨╛╨▓╨╕╤З ╤Г╨╝╨╡╨╡╤В ╨╜╨░╨╣╤В╨╕ ╨┐╨╛╨┤╤Е╨╛╨┤ ╨║ ╨║╨░╨╢╨┤╨╛╨╝╤Г ╤Г╤З╨╡╨╜╨╕╨║╤Г. ╨а╨╡╨║╨╛╨╝╨╡╨╜╨┤╤Г╤О ╤Н╤В╤Г ╨░╨▓╤В╨╛╤И╨║╨╛╨╗╤Г ╨▓╤Б╨╡╨╝, ╨║╤В╨╛ ╤Е╨╛╤З╨╡╤В ╨╜╨░╤Г╤З╨╕╤В╤М╤Б╤П ╨▓╨╛╨┤╨╕╤В╤М ╤Г╨▓╨╡╤А╨╡╨╜╨╜╨╛ ╨╕ ╨▒╨╡╨╖╨╛╨┐╨░╤Б╨╜╨╛.',5,1,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(2,'╨Ь╨╕╤Е╨░╨╕╨╗ ╨б.','╨Ъ╨░╤В╨╡╨│╨╛╤А╨╕╨╕ A ╨╕ B','2024-12-01','╨Ь╨б','╨Ю╤В╨╗╨╕╤З╨╜╨░╤П ╨░╨▓╤В╨╛╤И╨║╨╛╨╗╨░! ╨Я╤А╨╛╤И╨╡╨╗ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╨╡ ╤Б╨╜╨░╤З╨░╨╗╨░ ╨╜╨░ ╨║╨░╤В╨╡╨│╨╛╤А╨╕╤О B, ╨╖╨░╤В╨╡╨╝ ╨╜╨░ A. ╨Ю╨▒╨░ ╤А╨░╨╖╨░ ╤Б╨┤╨░╨╗ ╤Н╨║╨╖╨░╨╝╨╡╨╜╤Л ╤Б ╨┐╨╡╤А╨▓╨╛╨│╨╛ ╤А╨░╨╖╨░ ╨▒╨╗╨░╨│╨╛╨┤╨░╤А╤П ╨╛╤В╨╗╨╕╤З╨╜╨╛╨╣ ╨┐╨╛╨┤╨│╨╛╤В╨╛╨▓╨║╨╡. ╨Ю╤Б╨╛╨▒╨╡╨╜╨╜╨╛ ╨┐╨╛╨╜╤А╨░╨▓╨╕╨╗╨╕╤Б╤М ╨╛╨╜╨╗╨░╨╣╨╜-╤В╨╡╤Б╤В╤Л ╨╕ ╨╝╨╛╨▒╨╕╨╗╤М╨╜╨╛╨╡ ╨┐╤А╨╕╨╗╨╛╨╢╨╡╨╜╨╕╨╡.',5,1,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(3,'╨Х╨╗╨╡╨╜╨░ ╨Э.','╨Ъ╨░╤В╨╡╨│╨╛╤А╨╕╤П B','2025-02-01','╨Х╨Э','╨С╨╛╤П╨╗╨░╤Б╤М ╤Б╨░╨┤╨╕╤В╤М╤Б╤П ╨╖╨░ ╤А╤Г╨╗╤М, ╨╜╨╛ ╨▒╨╗╨░╨│╨╛╨┤╨░╤А╤П ╤В╨╡╤А╨┐╨╡╨╜╨╕╤О ╨╕╨╜╤Б╤В╤А╤Г╨║╤В╨╛╤А╨░ ╨Ш╨│╨╛╤А╤П, ╨┐╤А╨╡╨╛╨┤╨╛╨╗╨╡╨╗╨░ ╤Б╨▓╨╛╨╣ ╤Б╤В╤А╨░╤Е. ╨в╨╡╨┐╨╡╤А╤М ╨▓╨╛╨╢╤Г ╤Б ╤Г╨┤╨╛╨▓╨╛╨╗╤М╤Б╤В╨▓╨╕╨╡╨╝! ╨б╨┐╨░╤Б╨╕╨▒╨╛ ╨░╨▓╤В╨╛╤И╨║╨╛╨╗╨╡ ╨╖╨░ ╨╕╨╜╨┤╨╕╨▓╨╕╨┤╤Г╨░╨╗╤М╨╜╤Л╨╣ ╨┐╨╛╨┤╤Е╨╛╨┤ ╨╕ ╨▓╨╜╨╕╨╝╨░╨╜╨╕╨╡ ╨║ ╨║╨░╨╢╨┤╨╛╨╝╤Г ╤Г╤З╨╡╨╜╨╕╨║╤Г.',5,1,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(4,'╨Ф╨╝╨╕╤В╤А╨╕╨╣ ╨Ъ.','╨Ъ╨░╤В╨╡╨│╨╛╤А╨╕╤П B','2024-11-01','╨Ф╨Ъ','╨Я╤А╨╛╤Д╨╡╤Б╤Б╨╕╨╛╨╜╨░╨╗╤М╨╜╤Л╨╡ ╨╕╨╜╤Б╤В╤А╤Г╨║╤В╨╛╤А╤Л, ╤Б╨╛╨▓╤А╨╡╨╝╨╡╨╜╨╜╤Л╨╡ ╨░╨▓╤В╨╛╨╝╨╛╨▒╨╕╨╗╨╕ ╨╕ ╨╛╤В╨╗╨╕╤З╨╜╨░╤П ╤В╨╡╨╛╤А╨╡╤В╨╕╤З╨╡╤Б╨║╨░╤П ╨▒╨░╨╖╨░. ╨б╨┤╨░╨╗ ╤Н╨║╨╖╨░╨╝╨╡╨╜ ╤Б ╨┐╨╡╤А╨▓╨╛╨│╨╛ ╤А╨░╨╖╨░. ╨Ю╤Б╨╛╨▒╨╡╨╜╨╜╨╛ ╤Е╨╛╤З╤Г ╨╛╤В╨╝╨╡╤В╨╕╤В╤М ╨║╨░╤З╨╡╤Б╤В╨▓╨╛ ╨┐╤А╨░╨║╤В╨╕╤З╨╡╤Б╨║╨╕╤Е ╨╖╨░╨╜╤П╤В╨╕╨╣.',5,1,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(5,'╨Р╨╗╨╡╨║╤Б╨╡╨╣ ╨Т.','╨Ъ╨░╤В╨╡╨│╨╛╤А╨╕╤П C','2024-10-01','╨Р╨Т','╨Я╤А╨╛╤И╨╡╨╗ ╨╛╨▒╤Г╤З╨╡╨╜╨╕╨╡ ╨╜╨░ ╨║╨░╤В╨╡╨│╨╛╤А╨╕╤О C. ╨Ю╤З╨╡╨╜╤М ╨┤╨╛╨▓╨╛╨╗╨╡╨╜ ╨║╨░╤З╨╡╤Б╤В╨▓╨╛╨╝ ╨┐╨╛╨┤╨│╨╛╤В╨╛╨▓╨║╨╕. ╨Ш╨╜╤Б╤В╤А╤Г╨║╤В╨╛╤А╤Л ╨╖╨╜╨░╤О╤В ╤Б╨▓╨╛╨╡ ╨┤╨╡╨╗╨╛, ╨╛╨▒╤К╤П╤Б╨╜╤П╤О╤В ╨┐╨╛╨╜╤П╤В╨╜╨╛ ╨╕ ╨┤╨╛╤Б╤В╤Г╨┐╨╜╨╛. ╨а╨╡╨║╨╛╨╝╨╡╨╜╨┤╤Г╤О!',5,1,'2025-09-10 16:47:21','2025-09-10 16:47:21'),(6,'╨Ю╨╗╤М╨│╨░ ╨Я.','╨Ъ╨░╤В╨╡╨│╨╛╤А╨╕╤П B','2025-01-01','╨Ю╨Я','╨Ч╨░╨╝╨╡╤З╨░╤В╨╡╨╗╤М╨╜╨░╤П ╨░╨▓╤В╨╛╤И╨║╨╛╨╗╨░! ╨У╨╕╨▒╨║╨╕╨╣ ╨│╤А╨░╤Д╨╕╨║ ╨╖╨░╨╜╤П╤В╨╕╨╣, ╨╛╨┐╤Л╤В╨╜╤Л╨╡ ╨╕╨╜╤Б╤В╤А╤Г╨║╤В╨╛╤А╤Л ╨╕ ╤Б╨╛╨▓╤А╨╡╨╝╨╡╨╜╨╜╨╛╨╡ ╨╛╨▒╨╛╤А╤Г╨┤╨╛╨▓╨░╨╜╨╕╨╡. ╨з╤Г╨▓╤Б╤В╨▓╤Г╤О ╤Б╨╡╨▒╤П ╤Г╨▓╨╡╤А╨╡╨╜╨╜╨╛ ╨╜╨░ ╨┤╨╛╤А╨╛╨│╨╡.',5,1,'2025-09-10 16:47:21','2025-09-10 16:47:21');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (8,3,'$2b$10$Eu.bGqAoRHRSj2jy5Ch0c.w.veV3h3iEty10XC2fWz5tp9ZiWsnsK','2025-09-08 11:50:33','2025-09-01 11:50:33',0),(9,3,'$2b$10$LlzPgdKk7jMFmwFYK34ygeAYQiUxT5vncSmjlHe2h4qZR1jKA1b/q','2025-10-01 11:56:48','2025-09-01 11:56:48',0),(11,3,'$2b$10$VecOruDuD9VZS59F0BSVtO2Fd7357ezxo7ri0LPoeOE/PtUEAm1/O','2025-09-08 12:01:27','2025-09-01 12:01:27',0),(15,3,'$2b$10$zH4q5j3Sxdm.Q5LW8bsWAeTj6k6qsE4nlIkxAyUKhLMpPRm2EfSMK','2025-09-08 12:36:28','2025-09-01 12:36:28',0),(16,3,'$2b$10$KmTqXwQw9X2JOXcqXDDC4e46B3uFulDwYKqdtrKX5K93aWvMznzA6','2025-09-08 12:37:22','2025-09-01 12:37:22',0),(22,3,'$2b$10$OgPqkgW7pE2cHkHORmNtvu2NJCnTKuDq5WRr5F/pQs/0snBWgXaN2','2025-10-02 08:06:42','2025-09-02 08:06:42',0),(23,3,'$2b$10$L0i7QKTNCbxAgLX0UxAGzefqLEbmwQUIAucUbt85toeVDH3ruEdu.','2025-09-09 08:23:42','2025-09-02 08:23:42',0),(24,3,'$2b$10$KsVfcPvJK6gDSPQlARK.Ru7W2OiEbHWZBMCFC4.YdZ0jV2n0BDAa6','2025-10-02 14:12:37','2025-09-02 14:12:37',0),(25,3,'$2b$10$/gNX1MSccqj9s.0dibUiLeeP.03P.i/fmz2KQ6MPb0T5Zrj.m1coe','2025-09-09 14:17:39','2025-09-02 14:17:38',0),(26,3,'$2b$10$qJffw0vo8z9uMzUf5NFI4uKCkYfuy9cOLZOiUdQzueEP21TvejwGG','2025-09-09 14:17:44','2025-09-02 14:17:44',0),(27,3,'$2b$10$uwirilvKapfvZQVkG70kLu/rocxVFzftejrw29GCVnDzQSO/ziSsu','2025-10-02 14:26:59','2025-09-02 14:26:59',0),(28,3,'$2b$10$YblizzxpuZQhz6438kSEkOAZayRezJvUUdPfONZLjmEhHYpNROr6G','2025-09-09 16:11:51','2025-09-02 16:11:51',0),(29,3,'$2b$10$gfK/puuToyQYBTr.xDkQ7u.wkpwT2sRFROJtRIvS0NPjtz7aq8HeG','2025-09-10 08:34:18','2025-09-03 08:34:18',0),(30,3,'$2b$10$Z/r2M./9ZnTy2Meop8m.kOrM11/Fd1R5co/tAUeM4AM6WouOOYGmS','2025-09-10 08:52:25','2025-09-03 08:52:25',0),(31,3,'$2b$10$xFBkiSgjpw8p0Pw.SJSWjety0AneIqVsCCrO8o9lj6HhYu/BM3iCa','2025-09-10 09:04:58','2025-09-03 09:04:58',0),(32,3,'$2b$10$sap6Zdilf7ykTql5A7Inh.YXjSTTyeR7WSM8ox5KAF4wb9dTb78cO','2025-09-10 09:11:44','2025-09-03 09:11:44',0),(33,3,'$2b$10$ARhpCK6WFzonut5v7XfnUep3c7x3BXZ6qJjnPIHkPop1WAqugBWwu','2025-09-10 10:29:32','2025-09-03 10:29:32',0),(36,3,'$2b$10$pRhCLMCzQAUa9aegLV5Q4eQLqaHk3GCAVcn.f7jBgZjDwWk1Y3jkG','2025-09-11 07:09:23','2025-09-04 07:09:23',0),(37,3,'$2b$10$BFq9gmb43Z3RJUm9qOFhYuWN0zadtEoRCgtJQ5nQJE/fObIwSIAn.','2025-09-11 08:44:39','2025-09-04 08:44:38',0),(39,3,'$2b$10$kHSE.ehZx8m/u9I9D4.DJu5zdvriJCZls8Rv/XQRYYDrsQEZFGwIi','2025-09-11 08:55:42','2025-09-04 08:55:41',0),(44,3,'$2b$10$.7UwTjyzeivnS9TrS8yaoObMJTupMO3xLC8UU3o2Z7AHHD06hGtC6','2025-09-12 08:40:03','2025-09-05 08:40:03',0),(45,3,'$2b$10$7qc/FbcDoGGCEPrRmei8Wul7N8BTp2GG80oUoQd4z6Lk0EaQhICX.','2025-09-12 08:40:25','2025-09-05 08:40:25',0),(48,3,'$2b$10$TKbL3Q4jB/psspBILzTyYeWZRk4EPEFpnOdQR9r7BloghFFEikhaC','2025-09-12 18:30:46','2025-09-05 18:30:46',0),(49,3,'$2b$10$l/nefsZmUlI7Tid/X7syNOQETxva6TYyB5mQ1QWOhQyV2g3yZiRtG','2025-09-12 18:35:33','2025-09-05 18:35:32',0),(51,3,'$2b$10$vv8lZmTxOjwAs.AAYeLYhu1I3w2Sep3CSY.V8sU2uwCImxqWgWZVa','2025-09-12 19:30:42','2025-09-05 19:30:41',0),(53,3,'$2b$10$Cvy01wHlj1Mu7liIhrMseerFhK0wGvamc3CWSP4n.9kccENITwpvK','2025-09-12 19:44:57','2025-09-05 19:44:57',0),(54,3,'$2b$10$QBjAociOhHE3CKunGsZo3epQLewQBZHxRaoOfcD1ii5pQ.dVoankC','2025-09-12 19:49:38','2025-09-05 19:49:37',0),(56,3,'$2b$10$7bOfpXpRTJ8VM5A8oY2.HeQPX1WMG6Atp2aJkx.FWrlBtOJz8K5Jm','2025-09-12 20:16:29','2025-09-05 20:16:28',0),(58,3,'$2b$10$znYHynRc0TgJLPht0czlv.GqgB/B7dd45XNCS8TZSuOg6cBVt2R3C','2025-09-12 21:43:56','2025-09-05 21:43:55',0),(59,3,'$2b$10$y42mbg1W5ol9v5gBAmgP4eYZqRIbFYld6hrLQpoWEmmb/y4Hfi8Ta','2025-09-12 22:00:04','2025-09-05 22:00:03',0),(60,3,'$2b$10$aJDXyOzLvThW7dfFWGgl8OVY2quxw4Z6D12qkaQeizVX54GCao7u2','2025-09-16 07:13:31','2025-09-09 07:13:31',0),(62,3,'$2b$10$tPgr.Jy9XQhZ0GuFRRrESuANj.9/dAHhNv8YVQBUkbdnopHC6CkbK','2025-09-16 10:59:40','2025-09-09 10:59:39',0),(63,3,'$2b$10$QtatiKkYF/xV/jy11GN9Vu5UGX8jBt5n4iDrK9mrGCXuo9mDcEsOK','2025-09-16 14:42:21','2025-09-09 14:42:21',0),(64,3,'$2b$10$4ewy3xUzxCzWv.bK9B.q6./kJOyqaWKsn2XqXjDaRN98S8eDO6ZF6','2025-09-17 12:37:34','2025-09-10 12:37:33',0),(65,3,'$2b$10$/qLgsEetcyUQ.P.Ss3q0WuC.9XHrEICHE8r2zGPpdxpGBz3wy2l1y','2025-09-17 13:09:39','2025-09-10 13:09:39',0),(70,3,'$2b$10$.aeYmwRwapm6AuAwDJTzv.yK.fu7mMu.40qL6xpuCZIAQeFuxhVNG','2025-09-17 13:25:40','2025-09-10 13:25:40',0),(71,3,'$2b$10$EseqJMMt4p4s..2gMygpYefzi1BbbEMWDwPfWdBeucp9GDrYOMAUu','2025-09-17 13:41:32','2025-09-10 13:41:32',0),(72,3,'$2b$10$GETZ3I4ruhQLWAfH1Hytv.ZPuvDcq77M/yiuK8tP.pyDATM0i/tke','2025-10-10 15:47:51','2025-09-10 15:47:51',0),(75,3,'$2b$10$SOf01UawS8hMF5U4nc.ZBei24nH/Hz83jFmK4o5DQMqsBWZ4oQdzu','2025-09-18 08:41:45','2025-09-11 08:41:44',0),(80,3,'$2b$10$Jm7m33ZgOGtOCVEx0ial5.59usSTEsjBwvnTgZ3N81mUActenHtGy','2025-09-18 09:08:28','2025-09-11 09:08:28',1),(81,3,'$2b$10$cCvt7SOEhcgZkU70hnWJduxM1/Hk7cJZP0fRVb4XWqPl1H56sxLAK','2025-09-18 09:15:20','2025-09-11 09:15:20',1),(82,3,'$2b$10$AQBcBPi8aRBu2a9/LobdBOk17r6HVjcBnDu7Qf5sHLD/lpZkRo8u2','2025-09-18 09:16:45','2025-09-11 09:16:44',1),(83,3,'$2b$10$XRdnyG.me5dbL7c519LSlet4Be2S9wrr8O1TgLrW7TR3lRJwXBale','2025-09-19 11:39:41','2025-09-12 11:39:41',1),(84,3,'$2b$10$xJrXqN4I4SJ2Wq7..3ncWuFg4hEieZbG2j/YvFAzJcFOr7xZIftFi','2025-09-19 11:42:51','2025-09-12 11:42:50',1),(85,3,'$2b$10$mcMp/Bmi5PolSLjGwFsHc.4ObVmIPNKv59KQD15LB7fARX72JRMRS','2025-09-19 12:38:09','2025-09-12 12:38:08',1),(89,3,'$2b$10$2Z0UBG4ya/l3ctETY1p0yeg2YS/wM7iGuTjYZrq0MDPd/3BtrJVs.','2025-09-29 16:13:53','2025-09-22 16:13:53',1),(91,3,'$2b$10$TnwizfXa3DeS17kvD46zNuxzRQ2WJw9q8NSQeF7wlMfWdEO4PlaMy','2025-09-29 17:00:35','2025-09-22 17:00:35',1),(92,3,'$2b$10$YQpkqlwd61OcV.nxBFhKkuASur82HCsukNojykWE9wlUOZEdHtvJa','2025-09-29 17:06:59','2025-09-22 17:06:59',1),(97,3,'$2b$10$o0PMyea6AQZGXCJmADw9xe5t.HGT.DBuecg1GVY6UkxagNNAu6lyG','2025-09-29 20:02:56','2025-09-22 20:02:55',1),(101,3,'$2b$10$1mA.q/wI257A2D.kiWoXBOStL7MfDcm.J7EyHWtYZDAAE.9zFCtXW','2025-09-29 23:57:33','2025-09-22 23:57:32',1),(117,3,'$2b$10$TXQOvsy88BuYNOHXaQiPweO0E3eqz.dZ359cKGJqhuqdeASdP69La','2025-09-30 12:42:38','2025-09-23 12:42:38',1),(118,3,'$2b$10$QExk/dGokikI65ry45p8R.0.5OL9vTJ9ECkKvkA98KUCXXZL7lCkm','2025-09-30 13:22:11','2025-09-23 13:22:11',1),(120,3,'$2b$10$4Y5MiLahz/XEosGfFiZ47eK6Oc6/LsA6.fgVO0rTDPKl93.ctO.KC','2025-09-30 13:22:45','2025-09-23 13:22:45',1),(121,3,'$2b$10$8R.C.fjCpjghKnzyzkdJJua3XXWrmtxdejGEgAbufa6NuF6swjyjq','2025-09-30 13:42:14','2025-09-23 13:42:13',1),(122,30,'$2b$10$I26E5O5oeKzOc6oe3HnvmulMzsC.zMofYDqGgCpIvFZpYg0vze6Ze','2025-09-30 14:18:22','2025-09-23 14:18:21',1),(123,31,'$2b$10$xH4LCZ7qhD4J3npPpfH7pulysCVIvvfEGzyZetp3e0pW1zUlF1fCm','2025-09-30 14:19:24','2025-09-23 14:19:23',1),(124,3,'$2b$10$zCXh7jqDcGDSMoLq7TnXqe/D8fp1ZiJWpX4Ex1aFNoIbwAwaDBPsi','2025-09-30 14:51:15','2025-09-23 14:51:15',1),(125,31,'$2b$10$FjeStYmyCmRgXry301Bx1OSMDa1PPYMcI8lua5pPGxmEsmKehyw1u','2025-09-30 14:54:21','2025-09-23 14:54:21',1);
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('student','instructor','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'student',
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'╨Р╨┤╨╝╨╕╨╜╨╛╨▓','╨Р╨┤╨╝╨╕╨╜╨║╨░','admin@autoshkola.ru','+7(999)999-99-99','$2b$12$UjudQrEzPiLy1DeLGORWSeu/ircG2.y/VQZYAT1SI2ofWT8BJm93.','/uploads/avatars/avatar-3-1758640596141-727685312.png','admin',1,1,'2025-09-01 11:47:50','2025-09-23 15:16:36'),(9,'Admin','User','admin@test.com','1234567890','$2b$12$wfggQePqRkJ923OAo0O1ke0AQkqzZHoSbI5Vyeea0eVBs.OvTX/q2',NULL,'admin',1,1,'2025-09-05 20:13:22','2025-09-05 20:13:22'),(30,'╨Р╨╣╨░╤А╤Г','╨в╨░╨╗╨│╨░╤В','Ayaru@mail.ru','88005553535','$2b$12$r9ahiK6LCGd8n4vBDkTzAeecZI3pilmnM5P.CVrYHRnS2f7ErHXim','/uploads/avatars/avatar-30-1758637117825-637259361.png','instructor',1,0,'2025-09-23 14:17:46','2025-09-23 14:18:37'),(31,'╨Р╤Б╨╝╨╕╤А','╨Ъ╨╡╤А╨╕╨╝╨▒╨░╨╡╨▓','asmir@gmail.com','87767288210','$2b$12$MfxpaxOwBAayZ1cCdOGC5Ou7DsHcNaMe.yVJ/pzqxqLVUNt4BoETi','/uploads/avatars/avatar-31-1758637184363-184409072.png','student',1,0,'2025-09-23 14:19:23','2025-09-23 14:19:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-24 21:09:25
