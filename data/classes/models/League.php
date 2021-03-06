<?php
/*
    Model representing a league
*/

class League{
    public $name;
    public $homeGames;
    public $needThe;
    public $isEuropean;
    public $avgKitCost;
    public $avgTicketCost;

    /* Hidden values */
    private $prettyName;


    public function getName(){
        return $this->name;
    }

    public function setName($name){
        $this->name = $name;
    }

    public function getPrettyName(){
        return $this->prettyName;
    }

    public function setPrettyName($prettyName){
        $this->prettyName = $prettyName;
    }

    public function getHomeGames(){
        return $this->homeGames;
    }

    public function setHomeGames($homeGames){
        $this->homeGames = $homeGames;
    }

    public function getNeedThe(){
        return $this->needThe;
    }

    public function setNeedThe($needThe){
        $this->needThe = ($needThe=="1");
    }

    public function getAvgKitCost(){
        return $this->avgKitCost;
    }

    public function setAvgKitCost($avgKitCost){
        $this->avgKitCost = $avgKitCost;
    }

    public function getAvgTicketCost(){
        return $this->avgTicketCost;
    }

    public function setAvgTicketCost($avgTicketCost){
        $this->avgTicketCost = $avgTicketCost;
    }

    public function getIsEuropean(){
        return $this->isEuropean;
    }

    public function setIsEuropean($isEuropean){
        $this->isEuropean = ($isEuropean=="1");
    }
} 