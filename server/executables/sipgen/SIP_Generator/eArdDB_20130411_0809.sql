-- MySQL Administrator dump 1.4
--
-- ------------------------------------------------------
-- Server version	5.1.67-0ubuntu0.10.04.1


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


--
-- Create schema sip_db
--

CREATE DATABASE IF NOT EXISTS sip_db;
USE sip_db;

--
-- Definition of table `sip_db`.`droidinfo`
--

DROP TABLE IF EXISTS `sip_db`.`droidinfo`;
CREATE TABLE  `sip_db`.`droidinfo` (
  `paketuid` varchar(255) DEFAULT NULL,
  `filepath` varchar(1024) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `name` varchar(512) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `puid` varchar(50) DEFAULT NULL,
  `mimevalue` varchar(512) DEFAULT NULL,
  `idwarning` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sip_db`.`droidinfo`
--

/*!40000 ALTER TABLE `droidinfo` DISABLE KEYS */;
LOCK TABLES `droidinfo` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `droidinfo` ENABLE KEYS */;


--
-- Definition of table `sip_db`.`manuellinfo`
--

DROP TABLE IF EXISTS `sip_db`.`manuellinfo`;
CREATE TABLE  `sip_db`.`manuellinfo` (
  `paketuid` varchar(255) CHARACTER SET latin1 NOT NULL,
  `metsObjId` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `metsId` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `metsLabel` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `metsType` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `creOrgNamn` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `creIndNamn` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `creIndTelefon` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `creIndMail` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `creSoftwareNamn` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `arcOrgNamn` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `arcOrgOrgNr` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `arcSoftwareNamn` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `preOrgNamn` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `preOrgOrgNr` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `altRecDelType` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `altRecDelSpec` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `altRecStartDate` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `altRecSubAgr` varchar(512) CHARACTER SET latin1 DEFAULT NULL,
  `metsDocId` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  PRIMARY KEY (`paketuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

--
-- Dumping data for table `sip_db`.`manuellinfo`
--

/*!40000 ALTER TABLE `manuellinfo` DISABLE KEYS */;
LOCK TABLES `manuellinfo` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `manuellinfo` ENABLE KEYS */;


--
-- Definition of table `sip_db`.`mets`
--

DROP TABLE IF EXISTS `sip_db`.`mets`;
CREATE TABLE  `sip_db`.`mets` (
  `paketuid` varchar(255) DEFAULT NULL,
  `filuid` varchar(255) DEFAULT NULL,
  `filnamn` varchar(512) DEFAULT NULL,
  `fildatum` varchar(255) DEFAULT NULL,
  `mime` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `filbyte` varchar(255) DEFAULT NULL,
  `hashsum` varchar(255) DEFAULT NULL,
  `hashsumtype` varchar(255) DEFAULT NULL,
  `path` varchar(1024) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sip_db`.`mets`
--

/*!40000 ALTER TABLE `mets` DISABLE KEYS */;
LOCK TABLES `mets` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `mets` ENABLE KEYS */;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
