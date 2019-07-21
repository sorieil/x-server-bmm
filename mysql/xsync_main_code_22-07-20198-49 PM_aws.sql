# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: test-rds-db.cluster-ro-cfucr7qnmfpn.ap-northeast-2.rds.amazonaws.com (MySQL 5.6.10)
# Database: xsync_main
# Generation Time: 2019-07-22 11:49:52 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table code
# ------------------------------------------------------------

DROP TABLE IF EXISTS `code`;

CREATE TABLE `code` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `name` varchar(255) NOT NULL,
  `category` enum('information','company_info_type','business_category','service_category','field_type') DEFAULT NULL,
  `sort` tinyint(4) NOT NULL DEFAULT '0',
  `columnType` enum('textarea','text','select_box','no_type','null') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

LOCK TABLES `code` WRITE;
/*!40000 ALTER TABLE `code` DISABLE KEYS */;

INSERT INTO `code` (`id`, `createdAt`, `updatedAt`, `name`, `category`, `sort`, `columnType`)
VALUES
	(1,'2019-07-15 00:05:00.057923','2019-07-15 00:05:00.057923','주관식(단문)','information',0,'text'),
	(2,'2019-07-15 00:05:39.585130','2019-07-15 00:05:39.585130','주관식(장문)','information',0,'text'),
	(3,'2019-07-15 00:06:02.858559','2019-07-15 00:06:02.858559','체크박스','information',0,'text'),
	(4,'2019-07-15 00:31:24.525602','2019-07-15 00:31:24.525602','기업정보','company_info_type',0,'text'),
	(5,'2019-07-15 00:31:24.531991','2019-07-15 00:31:24.531991','참가정보','company_info_type',0,'text'),
	(6,'2019-07-15 00:31:24.538588','2019-07-15 00:31:24.538588','담당자정보','company_info_type',0,'text');

/*!40000 ALTER TABLE `code` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
