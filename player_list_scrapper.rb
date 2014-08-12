require 'nokogiri'
require 'open-uri'
require 'json'
require 'mongoid'
require 'pry'

Mongoid.load!("config/mongoid.yml")

class Player
  include Mongoid::Document
  include Mongoid::Timestamps

  field :full_name, type: String
  field :position, type: Array, default: []
  field :height, type: Integer
  field :weight, type: Integer
  field :dob, type: Date
  embeds_many :games_stat, class_name: "GameStat"
end


#get the player name keyword for getting the correct url
search_term = "Allen".strip.gsub(' ','+')
search_result = []

#findout which years the player play at least one game
url = "http://www.basketball-reference.com/players/p/"
data = Nokogiri::HTML(open(url))

data.xpath("//div[@id='div_players']/table/tbody/tr").each do |tr|
  Player.create!(
    full_name: tr.css('td')[0].text(),
    position: tr.css('td')[3].text().split('-'),
    height: tr.css('td')[4].text(),
    weight: inches_to_cm(tr.css('td')[5].text()),
    dob: Date.new(tr.css('td')[6].text())    
  )
end

def inches_to_cm(length)
  feet, inches = length.split("-")
  (feet.to_i * 30.48 + inches.to_i * 2.54).round
end
