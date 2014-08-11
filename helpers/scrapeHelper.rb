helpers do

  def scrapping_player_stat(player_name)
    #get the player name keyword for getting the correct url
    firstname, lastname = player_name.strip.downcase.split(" ")
    player_keyword = lastname[0,5] + firstname[0,2]
    player_info = {}

    #findout which years the player play at least one game
    url = "http://www.basketball-reference.com/players/#{lastname[0]}/#{player_keyword}01.html"

    data = Nokogiri::HTML(open(url))
    years_played = []

    if (player_info[:fullName] = data.xpath("//h1").text()) != "File Not Found"
      data.xpath("//table[@id='totals']/tbody/tr[not(contains(@class, 'italic_text'))]").each do |tr|
        years_played << tr.css('td')[0].text[0,4].to_i + 1  
      end
      #There are two html structure for old player and new player.
      if (data.xpath("//div[@class='person_image_offset']").empty?)
        player_info[:position] = data.xpath("//div[@id='info_box']/p[2]/text()[1]").text()
        player_info[:height] = data.xpath("//div[@id='info_box']/p[2]/text()[3]").text()
        player_info[:weight] = data.xpath("//div[@id='info_box']/p[2]/text()[4]").text()
      else
        player_info[:position] = data.xpath("//div[@class='person_image_offset']/p[2]/text()[1]").text()
        player_info[:height] = data.xpath("//div[@class='person_image_offset']/p[2]/text()[3]").text()
        player_info[:weight] = data.xpath("//div[@class='person_image_offset']/p[2]/text()[4]").text()
      end
      player_info  = normalize_player_info(player_info)

      if years_played.empty?
        puts "The game has no game record."
      else
        yearly_game_stat = {yearlyGameStat: []}
        years_played.each do |year|
          url = "http://www.basketball-reference.com/players/#{lastname[0]}/#{player_keyword}01/gamelog/#{year}/"
          data = Nokogiri::HTML(open(url))
          year_game_stat = {year: year, yearGameStat: []}
          data.xpath("//table[@id=\"pgl_basic\"]/tbody/tr[not(contains(@class, 'thead')) and not(contains(@class, 'italic_text')) and not(contains(@id, '.0'))]").each do |tr|
            d = tr.css('td')
            each_game = {
              date: d[2].text.strip,
              age: parse_age(d[3].text.strip),
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
              ast: d[22].text.strip,
              stl: d[23].text.strip,
              blk: d[24].text.strip,
              tov: d[25].text.strip,
              pf: d[26].text.strip,
              pts: d[27].text.strip,
              plus_minus: d[28].text.strip
            }
            year_game_stat[:yearGameStat] << each_game
          end
          yearly_game_stat[:yearlyGameStat] << year_game_stat
        end
      end
    else
      puts "There is no such player (#{player_name})."
      raise "There is no such player (#{player_name})."
    end  
    player_info.merge(yearly_game_stat)
  end

  private

  def normalize_player_info(player_info)
    player_info[:position] = normalize_position(player_info[:position])
    player_info[:height] = inches_to_cm(player_info[:height])
    player_info[:weight] = parse_weight(player_info[:weight])
    player_info
  end

  def normalize_position(position_string)
    position_string.split("and").map do |pos| 
      pos = pos.strip.gsub(/[^\w\s]/, '').split(" ").inject("") do |short_pos, word|
        short_pos += word[0]
      end
    end
  end

  def inches_to_cm(length)
    feet, inches = length.split("-")
    (feet.to_i * 30.48 + inches.to_i * 2.54).round
  end

  def parse_weight(weight)
    weight.split(' ')[0].to_i
  end

  def parse_age(age)
    year, days = age.split('-')
    (year.to_i + days.gsub(/^[0]+/,'').to_i/365.0).round(3)
  end

end
