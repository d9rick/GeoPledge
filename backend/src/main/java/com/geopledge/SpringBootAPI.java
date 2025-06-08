package com.geopledge;

import com.geopledge.charity.Charity;
import com.geopledge.charity.CharityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.UUID;

@SpringBootApplication
public class SpringBootAPI {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootAPI.class, args);
	}

}
