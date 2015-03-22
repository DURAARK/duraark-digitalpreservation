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
-- Definition of table `sip_db`.`droidinfo`
--

DROP TABLE IF EXISTS `droidinfo`;
CREATE TABLE `droidinfo` (
  `paketuid` varchar(255) DEFAULT NULL,
  `filepath` varchar(1024) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `name` varchar(512) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `puid` varchar(50) DEFAULT NULL,
  `mimevalue` varchar(512) DEFAULT NULL,
  `idwarning` varchar(255) DEFAULT NULL
);


--
-- Definition of table `sip_db`.`manuellinfo`
--

DROP TABLE IF EXISTS `manuellinfo`;
CREATE TABLE  `manuellinfo` (
  `paketuid` varchar(255)  NOT NULL,
  `metsObjId` varchar(255)  DEFAULT NULL,
  `metsId` varchar(255)  DEFAULT NULL,
  `metsLabel` varchar(512)  DEFAULT NULL,
  `metsType` varchar(255)  DEFAULT NULL,
  `creOrgNamn` varchar(512)  DEFAULT NULL,
  `creIndNamn` varchar(512)  DEFAULT NULL,
  `creIndTelefon` varchar(255)  DEFAULT NULL,
  `creIndMail` varchar(512)  DEFAULT NULL,
  `creSoftwareNamn` varchar(512)  DEFAULT NULL,
  `arcOrgNamn` varchar(512)  DEFAULT NULL,
  `arcOrgOrgNr` varchar(512)  DEFAULT NULL,
  `arcSoftwareNamn` varchar(512)  DEFAULT NULL,
  `preOrgNamn` varchar(512)  DEFAULT NULL,
  `preOrgOrgNr` varchar(255)  DEFAULT NULL,
  `altRecDelType` varchar(255)  DEFAULT NULL,
  `altRecDelSpec` varchar(512)  DEFAULT NULL,
  `altRecStartDate` varchar(255)  DEFAULT NULL,
  `altRecSubAgr` varchar(512)  DEFAULT NULL,
  `metsDocId` varchar(255)  DEFAULT NULL,
  PRIMARY KEY (`paketuid`)
);


--
-- Definition of table `sip_db`.`mets`
--

DROP TABLE IF EXISTS `mets`;
CREATE TABLE  `mets` (
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
);

