require 'rubygems'
require 'nokogiri'
require 'open-uri'
require 'sinatra'
require 'json'
require 'mongoid'
require 'date'
require_relative 'helpers/scrapeHelper'

Mongoid.load!("config/mongoid.yml")

class Player
  include Mongoid::Document
  include Mongoid::Timestamps

  field :full_name, type: String
  field :position, type: Array, default: []
  field :height, type: Integer
  field :weight, type: Integer
  field :dob, type: Date
  field :name_key, type: String
  field :drafted_year, type: String
  field :pick, type: Integer
  field :pick_team, type: String
  embeds_many :games_stat, class_name: "GameStat"
  embeds_many :advanced_stat, class_name: "AdvancedStat"
end

class GameStat
  include Mongoid::Document

  field :date, type: Date
  field :age, type: Float
  field :team, type: String
  field :homecourt_flag, type: Boolean
  field :opp, type: String
  field :result, type: String
  field :gs_flag, type: Boolean
  field :mp, type: String 
  field :fg, type: Integer 
  field :fga, type: Integer 
  field :three_pt, type: Integer 
  field :three_pta, type: Integer 
  field :ft, type: Integer 
  field :fta, type: Integer 
  field :orb, type: Integer 
  field :drb, type: Integer 
  field :ast, type: Integer 
  field :stl, type: Integer 
  field :blk, type: Integer 
  field :tov, type: Integer 
  field :pf, type: Integer 
  field :pts, type: Integer 
  field :plus_minus, type: Integer
  embedded_in :player 
end

class AdvancedStat
  include Mongoid::Document

  field :season, type: Integer
  field :mp, type: Integer
  field :per, type: Float
  field :usg, type: Float
  field :ortg, type: Integer
  field :drtg, type: Integer
  field :ws, type: Float
  embedded_in :player 
end



get '/' do
  File.read(File.join('public/app', 'index.html'))
end

get '/advanced_data' do
  content_type :json
  drafted_players = Player.without(:games_stat).where(:pick.gte => 0, :drafted_year.gte => 1974)
  status 200
  body(drafted_players.to_json(except: [:_id]))
end


post '/scrape' do
  content_type :json
  ng_params = env['rack.input'].gets #request.body.read
  # check if the player already exist in the database
  player = Player.without(:drafted_year, :pick, :pick_team, :advanced_stat).where(name_key: ng_params).first
  unless player.games_stat.empty?
    body( player.to_json(except: [:_id]))
  else
    begin
      player_games_stat = scrapping_player_stat(ng_params)
      #Persist the web scrapped data into mongodb
      player_games_stat.each do |game_stat|
        player.games_stat.push(
          GameStat.new(game_stat)
        )       
      end
      status 200
      body(player.to_json(except: [:_id, :drafted_year, :pick, :pick_team, :advanced_stat]))
      puts "Sent a json response back"
    rescue =>error
      status 400
      puts error.backtrace
      body("There is some problem in the server. Please try it again.")
    end
  end
end

post '/search' do
  content_type :json

  begin
    ng_params = env['rack.input'].gets #request.body.read
    regex_for_search = ng_params.split(' ').reduce(''){|r, word| r+= "(?=.*"+word+")"}
    search_result = Player.where(full_name: /#{regex_for_search}.*/i).order_by(:dob.desc)
    if search_result.count == 0
      status 404
      puts "Could not find such player"
      body("Could not find such player")
    else
      player_namelist = search_result.to_a[0..9]
      status 200
      body(player_namelist.to_json(except: [:_id, :advanced_stat, :games_stat]))
        puts "Sent a json response back"
    end
  rescue =>error
    status 500
    puts error.backtrace
    body("There is some problem in the server. Please try it again.")    
  end
end
