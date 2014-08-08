require 'nokogiri'
require 'open-uri'
require 'sinatra'
require 'json'
require 'pry'

helpers do

  def scrapping_player_stat(player_name)
    firstname, lastname = player_name.split(" ")
    lastname = lastname.downcase[0,5]
    firstname = firstname.downcase[0,2]
    player_name = lastname + firstname

    #findout which years the player played at least one game
    url = "http://www.basketball-reference.com/players/#{lastname[0]}/#{player_name}01.html"
    data = Nokogiri::HTML(open(url))
    years_played = []
    data.xpath("//table[@id='totals']/tbody/tr[not(contains(@class, 'italic_text'))]").each do |tr|
      years_played << tr.css('td')[0].text[0,4].to_i + 1  
    end

    #return if no years found for that player
    if years_played.empty?
      return "There is no such player."
    else
      #scrapping all the games  
      player_games_stat = {}
      years_played.each do |year|
        url = "http://www.basketball-reference.com/players/#{lastname[0]}/#{player_name}01/gamelog/#{year}/"
        data = Nokogiri::HTML(open(url))
        games = []
        data.xpath("//table[@id=\"pgl_basic\"]/tbody/tr[not(contains(@class, 'thead')) and not(contains(@class, 'italic_text')) and not(contains(@id, '.0'))]").each do |tr|
          d = tr.css('td')
          each_game = {
            date: d[2].text.strip,
            age: d[3].text.strip,
            team: d[4].text.strip,
            homecourt_flag: d[5].text.strip.empty? ? 1 : 0,
            opp: d[6].text.strip,
            result: d[7].text.strip,
            gs_flag: d[8].text.strip,
            mp: d[9].text.strip,
            fg: d[10].text.strip,
            fga: d[11].text.strip,
            three_pt: d[13].text.strip,
            three_pta: d[14].text.strip,
            ft: d[16].text.strip,
            fta: d[17].text.strip,
            orb: d[19].text.strip,
            drb: d[20].text.strip,
            stl: d[22].text.strip,
            blk: d[23].text.strip,
            tov: d[24].text.strip,
            pf: d[25].text.strip,
            pts: d[26].text.strip,
            plus_minus: d[28].text.strip
          }
          games << each_game
        end
        player_games_stat.merge!({ "#{year}" => { games_stat: games}})
      end
    end
    player_games_stat
  end

end

get '/' do
  File.read(File.join('public/app', 'index.html'))
end

post '/search' do
  content_type :json
  ng_params = env['rack.input'].gets #request.body.read
  begin
    player_games_stat = scrapping_player_stat(ng_params)
    status 200
    body(player_games_stat.to_json)
  rescue
    status 400
    body("Please check your input.")
  end
end


